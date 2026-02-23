export type Product = {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  priceUsd: number;
  image: string;
  tag?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "프리미엄 무선 이어버드",
    nameEn: "Premium Wireless Earbuds",
    price: 189000,
    priceUsd: 149.99,
    image: "https://picsum.photos/seed/earbuds/400/400",
    tag: "BEST",
  },
  {
    id: "2",
    name: "미니멀 가죽 지갑",
    nameEn: "Minimal Leather Wallet",
    price: 59000,
    priceUsd: 45.99,
    image: "https://picsum.photos/seed/wallet/400/400",
  },
  {
    id: "3",
    name: "스마트 워치 Pro",
    nameEn: "Smart Watch Pro",
    price: 349000,
    priceUsd: 279.99,
    image: "https://picsum.photos/seed/watch/400/400",
    tag: "NEW",
  },
  {
    id: "4",
    name: "노이즈캔슬링 헤드폰",
    nameEn: "Noise Cancelling Headphones",
    price: 259000,
    priceUsd: 199.99,
    image: "https://picsum.photos/seed/headphone/400/400",
  },
];
