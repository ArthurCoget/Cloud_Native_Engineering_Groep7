/*
  Warnings:

  - You are about to drop the `_CartToDiscountCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartToDiscountCode" DROP CONSTRAINT "_CartToDiscountCode_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartToDiscountCode" DROP CONSTRAINT "_CartToDiscountCode_B_fkey";

-- DropTable
DROP TABLE "_CartToDiscountCode";
