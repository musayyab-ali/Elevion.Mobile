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
  LargeImagePath?: string;
  /** The variant to add to cart / wishlist (not always returned by list endpoints). */
  ProductDetailId?: number;
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

export interface Banner {
  BannerId: number;
  Name: string;
  ImageName: string;
  SortOrder: number;
  Status: number;
  PlateForm: number;
  Clickable: boolean;
  CategoryId: number;
  ImagePath: string;
  ProductId: number;
  TargetURL: number;
  BannerText: string;
  BannerSubText: string;
}

export interface BannerResponse {
  Message: string;
  Type: string;
  HttpStatusCode: number;
  Data: {
    WebPlateFormBanners: Banner[];
    MobilePlateFormBanners: Banner[];
  };
}
