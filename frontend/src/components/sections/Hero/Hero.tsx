import { Link } from "react-router-dom";
import { Button } from "@/components/ui";

export const Hero = () => {
  return (
    <section className="relative pt-16 overflow-hidden">
      {/* Gradient Background - Spotify-inspired */}
      <div className="absolute inset-0 bg-linear-to-b from-[#38c750] via-[#05240f] to-surface-base" />

      <div className="relative max-w-360 mx-auto px-6 lg:px-12 py-20 md:py-32 lg:py-40 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl lg:text-[80px] font-extrabold tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Dùng thử 3 tháng
          <br />
          <span className="text-primary">chỉ $4.99</span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10">
          Sau đó chỉ $9.99/tháng. Hủy bất cứ lúc nào.
          <br className="hidden md:block" />
          Nghe nhạc không quảng cáo, tải xuống nghe offline, và hơn thế nữa.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button size="lg">Bắt đầu ngay</Button>
          </Link>
          <Link to="/plans">
            <Button variant="outline" size="lg">
              Xem tất cả gói
            </Button>
          </Link>
        </div>

        <p className="text-xs text-text-muted max-w-md">
          Chỉ áp dụng cho gói Premium Individual.{" "}
          <a
            href="#terms"
            className="underline hover:text-text-secondary transition-colors"
          >
            Điều khoản áp dụng
          </a>
          .
        </p>
      </div>
    </section>
  );
};
