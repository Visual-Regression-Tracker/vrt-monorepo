# Migration `20210709115233-gh-275-max-branch-lifetime`

This migration has been generated by Pavel Strunkin at 7/9/2021, 2:52:33 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "Baseline" ADD COLUMN     "userId" TEXT

ALTER TABLE "Project" ADD COLUMN     "maxBranchLifetime" INTEGER NOT NULL DEFAULT 30

ALTER TABLE "Baseline" ADD FOREIGN KEY("userId")REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20210705154453-baseline-author..20210709115233-gh-275-max-branch-lifetime
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 model Build {
   id         String    @id @default(uuid())
@@ -31,8 +31,9 @@
   mainBranchName        String          @default("master")
   builds                Build[]
   buildsCounter         Int             @default(0)
   maxBuildAllowed       Int             @default(100)
+  maxBranchLifetime     Int             @default(30)
   testVariations        TestVariation[]
   updatedAt             DateTime        @updatedAt
   createdAt             DateTime        @default(now())
   // config
@@ -104,24 +105,24 @@
   testRunId       String?
   testRun         TestRun?      @relation(fields: [testRunId], references: [id])
   userId          String?
   user            User?         @relation(fields: [userId], references: [id])
-  updatedAt       DateTime      @updatedAt 
+  updatedAt       DateTime      @updatedAt
   createdAt       DateTime      @default(now())
 }
 model User {
-  id        String   @id @default(uuid())
-  email     String   @unique
+  id        String     @id @default(uuid())
+  email     String     @unique
   password  String
   firstName String?
   lastName  String?
-  apiKey    String   @unique
-  isActive  Boolean  @default(true)
+  apiKey    String     @unique
+  isActive  Boolean    @default(true)
   builds    Build[]
   baselines Baseline[]
-  updatedAt DateTime @updatedAt
-  createdAt DateTime @default(now())
+  updatedAt DateTime   @updatedAt
+  createdAt DateTime   @default(now())
 }
 enum TestStatus {
   failed
```

