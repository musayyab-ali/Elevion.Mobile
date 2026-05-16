export interface CategorySeo {
  MetaTitle: string;
  MetaDescription: string;
  UrlSlug: string;
  MetaKeywords: string;
}

export interface Category {
  CategoryId: number;
  ParentCategoryId: number;
  RootCategoryId: number;
  IsLeafNode: boolean;
  Name: string;
  Description: string;
  Status: number; // 1 = Active, 0 = InActive, etc.
  SortOrder: number;
  IsMainMenu: boolean;
  IsLandingPage: boolean;
  IsFeatured: boolean;
  Children: string[] | Category[]; // Can be IDs or nested objects
  ImageName: string;
  IconName: string;
  ImagePath: string;
  IconPath: string;
  CategoryURL: string;
  Seo: CategorySeo;
}

export interface CategoryResponse {
  Message: string;
  Type: string;
  HttpStatusCode: number;
  Data: Category[];
}

export interface CategoryQueryParams {
  CategoryId?: number;
  IsFeatured?: number; // 0 or 1
  IsMainMenu?: number; // 0 or 1
  Status?: number; // 1 for Active
}
export interface Product {
  ProductId: number;
  ProductName: string;
  Description: string;
  Price?: number;
  MinPrice?: number;
  MaxPrice?: number;
  ImageName: string;
  IsNewProduct: boolean;
  IsFeaturedProduct: boolean;
  IsProductInStock: boolean;
  ThumbnailImagePath?: string;
}

export interface LandingPageData {
  Category: {
    CategoryId: number;
    CategoryName: string;
  };
  ProductList: Product[];
}

export interface ProductByCategoryResponse {
  Data: {
    TotalRecords: number;
    ProductListViewModel: Product[];
    Category: string;
  };
}
