import React, { useEffect, useState, FormEvent } from "react";
import {
  Grid,
  Card,
  CardContent,
  TextField,
  CardActions,
  Button,
} from "@material-ui/core";
import RegisterForm from "../components/RegisterForm";
import { useHistory } from "react-router-dom";
import {
  useAuthState,
  useAuthDispatch,
  update,
} from "../contexts/auth.context";
import { routes } from "../constants";
import { usersService } from "../services";

const ProfilePage = () => {
  const { user } = useAuthState();
  const dispatch = useAuthDispatch();
  const [email, setEmail] = useState(user?.email);
  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [password, setPassword] = useState("");

  const handleUserUpdateSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (user && firstName && lastName && email) {
      usersService
        .update({
          id: user.id,
          firstName,
          lastName,
          email,
        })
        .then((user) => update(dispatch, user));
    }
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: "60vh" }}
    >
      <Grid item>
        <form onSubmit={handleUserUpdateSubmit}>
          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    label={"First name"}
                    type="text"
                    variant="outlined"
                    required
                    fullWidth
                    inputProps={{
                      onChange: (event) =>
                        setFirstName((event.target as HTMLInputElement).value),
                      "data-testid": "firstName",
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    label={"Last name"}
                    type="text"
                    variant="outlined"
                    required
                    fullWidth
                    inputProps={{
                      onChange: (event) =>
                        setLastName((event.target as HTMLInputElement).value),
                      "data-testid": "lastName",
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="email"
                    name="email"
                    value={email}
                    label={"Email address"}
                    type="text"
                    variant="outlined"
                    required
                    fullWidth
                    inputProps={{
                      onChange: (event) =>
                        setEmail((event.target as HTMLInputElement).value),
                      "data-testid": "email",
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Grid container justify="center">
                <Grid item>
                  <Button
                    type="submit"
                    color="primary"
                    variant="outlined"
                    data-testid="submit"
                  >
                    Update
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </form>
      </Grid>
    </Grid>
  );
};

export default ProfilePage;
