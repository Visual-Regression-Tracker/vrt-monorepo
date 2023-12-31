import React from "react";
import { Chip, Typography } from "@material-ui/core";
import TestStatusChip from "../TestStatusChip";
import {
  useTestRunState,
  useTestRunDispatch,
  useBuildState,
} from "../../contexts";
import { useSnackbar } from "notistack";
import {
  DataGrid,
  type GridCellParams,
  type GridColDef,
  type GridRowParams,
  type GridValueGetterParams,
  type GridValueFormatterParams,
  type GridCellValue,
  type GridSortCellParams,
  type GridStateChangeParams,
  type GridSortDirection,
  type GridSortModel,
} from "@material-ui/data-grid";
import { DataGridCustomToolbar } from "./DataGridCustomToolbar";
import { StatusFilterOperators } from "./StatusFilterOperators";
import { TagFilterOperators } from "./TagFilterOperators";
import { TestStatus } from "../../types";
import { testRunService } from "../../services";
import { useNavigate } from "react-router";
import { buildTestRunLocation } from "../../_helpers/route.helpers";

const columnsDef: GridColDef[] = [
  { field: "id", hide: true, filterable: false },
  { field: "name", headerName: "Name", flex: 1 },
  {
    field: "tags",
    headerName: "Tags",
    flex: 1,
    valueGetter: (params: GridValueGetterParams) => {
      const tags: Array<string> = [
        params.row["os"],
        params.row["device"],
        params.row["browser"],
        params.row["viewport"],
        params.row["customTags"],
      ];
      return tags.reduce(
        (prev, curr) => prev.concat(curr ? `${curr};` : ""),
        "",
      );
    },
    renderCell: (params: GridCellParams) => (
      <React.Fragment>
        {params
          .getValue(params.id, "tags")
          ?.toString()
          .split(";")
          .map(
            (tag) =>
              tag && (
                <Chip
                  key={tag}
                  size="small"
                  label={tag}
                  style={{ margin: "1px" }}
                />
              ),
          )}
      </React.Fragment>
    ),
    filterOperators: TagFilterOperators,
  },
  {
    field: "status",
    headerName: "Status",
    flex: 0.3,
    renderCell: (params: GridValueFormatterParams) => {
      return (
        <TestStatusChip
          status={params.getValue(params.id, "status")?.toString()}
        />
      );
    },
    sortComparator: (
      v1: GridCellValue,
      v2: GridCellValue,
      cellParams1: GridSortCellParams,
      cellParams2: GridSortCellParams,
    ) => {
      const statusOrder = Object.values(TestStatus);
      return (
        statusOrder.indexOf(v2 as TestStatus) -
        statusOrder.indexOf(v1 as TestStatus)
      );
    },
    filterOperators: StatusFilterOperators,
  },
];

const TestRunList: React.FunctionComponent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { selectedTestRun, testRuns, loading } = useTestRunState();
  const { selectedBuild } = useBuildState();
  const testRunDispatch = useTestRunDispatch();

  const [pageSize, setPageSize] = React.useState<number>(10);

  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "status",
      sort: "desc" as GridSortDirection,
    },
  ]);

  const getTestRunListCallback = React.useCallback(() => {
    testRunDispatch({ type: "request" });
    if (selectedBuild?.id) {
      testRunService
        .getList(selectedBuild.id)
        .then((payload) => testRunDispatch({ type: "get", payload }))
        .catch((err: string) =>
          enqueueSnackbar(err, {
            variant: "error",
          }),
        );
    } else {
      testRunDispatch({ type: "get", payload: [] });
    }
  }, [testRunDispatch, enqueueSnackbar, selectedBuild?.id]);

  React.useEffect(() => {
    getTestRunListCallback();
  }, [getTestRunListCallback]);

  return (
    <React.Fragment>
      {selectedBuild ? (
        <DataGrid
          rows={testRuns}
          columns={columnsDef}
          pageSize={pageSize}
          rowsPerPageOptions={[10, 30, 100]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          pagination
          loading={loading}
          components={{
            Toolbar: DataGridCustomToolbar,
          }}
          checkboxSelection
          disableColumnSelector
          disableColumnMenu
          disableSelectionOnClick
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
          onRowClick={(param: GridRowParams) => {
            navigate(
              buildTestRunLocation(
                selectedBuild.id,
                param.getValue(param.id, "id")?.toString(),
              ),
            );
          }}
          onStateChange={({ state }: GridStateChangeParams) => {
            if (!selectedTestRun) {
              // only if testRun modal is not shown
              testRunDispatch({
                type: "filter",
                payload: state.visibleRows.visibleRows,
              });
              testRunDispatch({
                type: "sort",
                payload: state.sorting.sortedRows,
              });
            }
          }}
        />
      ) : (
        <Typography variant="h5">Select build from list</Typography>
      )}
    </React.Fragment>
  );
};

export default TestRunList;
