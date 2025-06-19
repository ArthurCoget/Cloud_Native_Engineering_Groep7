export class Review {
  private id: number;
  private productId: number;
  private rating: number;
  private comment?: string;
  private customerId: string;
  private createdAt: Date;

  constructor(review: {
    id: number;
    productId: number;
    rating: number;
    comment?: string;
    customerId: string;
    createdAt: Date;
  }) {
    this.validate(review);
    this.id = review.id;
    this.productId = review.productId;
    this.rating = review.rating;
    this.comment = review.comment;
    this.customerId = review.customerId;
    this.createdAt = review.createdAt;
  }

  getId(): number | undefined {
    return this.id;
  }

  getProductId(): number {
    return this.productId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
  getRating(): number {
    return this.rating;
  }
  getComment(): string | undefined {
    return this.comment;
  }
  getCustomerId(): string {
    return this.customerId;
  }
  // getProduct(): Product {
  //     return this.product;
  // }

  setId(id: number): void {
    this.id = id;
  }

  setProductId(productId: number): void {
    this.productId = productId;
  }

  setCustomer(customerId: string): void {
    this.customerId = customerId;
  }

  setRating(rating: number): void {
    this.rating = rating;
  }

  setComment(comment: string): void {
    this.comment = comment;
  }

  // setProduct(product: Product): void {
  //     this.product = product;
  // }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }
  validate(review: { productId: number; rating: number; comment?: string }) {
    if (review.rating < 1 || review.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (review.comment && review.comment.length > 500) {
      throw new Error("Comment must be less than 500 characters");
    }
  }

  static fromCosmos(doc: {
    id: string | number;
    productId: number;
    rating: number;
    comment: string | null;
    customerId: string;
    createdAt: string | Date;
  }): Review {
    return new Review({
      id: typeof doc.id === "string" ? parseInt(doc.id, 10) : doc.id,
      productId: doc.productId,
      rating: doc.rating,
      comment: doc.comment ?? undefined,
      customerId: doc.customerId,
      createdAt:
        typeof doc.createdAt === "string"
          ? new Date(doc.createdAt)
          : doc.createdAt,
    });
  }
}
