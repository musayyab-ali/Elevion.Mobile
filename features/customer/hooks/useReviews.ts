import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";

export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const res = {
    Message: "Reviews retrieved successfully",
    StatusCode: 200,
    Data: {
      TotalRecords: 2,
      Reviews: [
        {
          ProductId: 501,
          ProductName: "Wireless Noise-Cancelling Headphones",
          Rating: 5,
          Review:
            "The sound quality is incredible! Best purchase I've made this year.",
          CustomerName: "Alex Rivera",
          ReviewPostedDate: "2023-10-15T10:30:00Z",
          ImagePath:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT15LdBf9O--lpzWkeU1lyycvhf8VOVxxUaZA&s",
          Category: {
            CategoryId: 12,
            CategoryName: "Electronics",
            CategoryDescription: "Gadgets and gear",
            Seo: {
              MetaTitle: "Best Electronics",
              MetaDescription: "Shop top gadgets",
              UrlSlug: "electronics",
              MetaKeywords: "tech, audio, gear",
            },
          },
          Seo: {
            MetaTitle: "Premium Headphones Review",
            MetaDescription: "Customer feedback on wireless headphones",
            UrlSlug: "wireless-headphones-review",
            MetaKeywords: "audio, review, headphones",
          },
        },
        {
          ProductId: 502,
          ProductName: "Ergonomic Office Chair",
          Rating: 4,
          Review:
            "Very comfortable for long work hours, though assembly took a while.",
          CustomerName: "Samantha Lee",
          ReviewPostedDate: "2023-11-02T14:15:00Z",
          ImagePath:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRb4eJczWvkaH5Eo63XL90pEe1-EbJblCuP_w&s",
          Category: {
            CategoryId: 8,
            CategoryName: "Furniture",
            CategoryDescription: "Home and office furniture",
            Seo: {
              MetaTitle: "Office Furniture",
              MetaDescription: "Quality office chairs",
              UrlSlug: "furniture",
              MetaKeywords: "office, chair, home",
            },
          },
          Seo: {
            MetaTitle: "Ergonomic Chair Review",
            MetaDescription: "Detailed user review of office chair",
            UrlSlug: "office-chair-review",
            MetaKeywords: "ergonomic, review, furniture",
          },
        },
      ],
    },
  };

  const fetchReviews = async (isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = isRefresh ? 1 : page;
      //   const res = await customerApi.getCustomerReviews(currentPage, 10);

      if (res?.Data?.Reviews) {
        setReviews(
          isRefresh ? res.Data.Reviews : [...reviews, ...res.Data.Reviews],
        );
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error("Review fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(true);
  }, []);

  return {
    reviews,
    loading,
    refresh: () => fetchReviews(true),
    loadMore: () => fetchReviews(false),
  };
};
