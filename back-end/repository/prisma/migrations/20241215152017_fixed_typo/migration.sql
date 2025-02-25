-- CreateTable
CREATE TABLE "_CartToDiscountCode" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CartToDiscountCode_AB_unique" ON "_CartToDiscountCode"("A", "B");

-- CreateIndex
CREATE INDEX "_CartToDiscountCode_B_index" ON "_CartToDiscountCode"("B");

-- AddForeignKey
ALTER TABLE "_CartToDiscountCode" ADD CONSTRAINT "_CartToDiscountCode_A_fkey" FOREIGN KEY ("A") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartToDiscountCode" ADD CONSTRAINT "_CartToDiscountCode_B_fkey" FOREIGN KEY ("B") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
