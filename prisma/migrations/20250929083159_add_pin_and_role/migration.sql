/*
  Warnings:

  - Added the required column `pin` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_usuarios" ("createdAt", "email", "id", "nombre", "password", "updatedAt") SELECT "createdAt", "email", "id", "nombre", "password", "updatedAt" FROM "usuarios";
DROP TABLE "usuarios";
ALTER TABLE "new_usuarios" RENAME TO "usuarios";
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "usuarios_pin_key" ON "usuarios"("pin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
