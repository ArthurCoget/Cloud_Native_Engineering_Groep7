-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CartToDiscountCode" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_CartToDiscountCode_AB_unique" ON "_CartToDiscountCode"("A", "B");

-- CreateIndex
CREATE INDEX "_CartToDiscountCode_B_index" ON "_CartToDiscountCode"("B");

-- AddForeignKey
ALTER TABLE "_CartToDiscountCode" ADD CONSTRAINT "_CartToDiscountCode_A_fkey" FOREIGN KEY ("A") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartToDiscountCode" ADD CONSTRAINT "_CartToDiscountCode_B_fkey" FOREIGN KEY ("B") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
