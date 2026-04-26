/*
  Warnings:

  - A unique constraint covering the columns `[numero]` on the table `andenes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `andenes_numero_key` ON `andenes`(`numero`);
