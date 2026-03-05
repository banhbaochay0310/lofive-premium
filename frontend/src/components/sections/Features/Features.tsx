import { Music, Download, Smartphone, SkipForward, Volume2, Users } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Music className="w-7 h-7" />,
    title: 'Nghe nhạc không quảng cáo',
    description: 'Tận hưởng âm nhạc liên tục mà không bị gián đoạn bởi quảng cáo.',
  },
  {
    icon: <Download className="w-7 h-7" />,
    title: 'Tải xuống nghe offline',
    description: 'Tải bài hát yêu thích và nghe bất cứ đâu, ngay cả khi không có mạng.',
  },
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: 'Nghe trên mọi thiết bị',
    description: 'Chuyển đổi liền mạch giữa điện thoại, máy tính bảng, desktop và loa.',
  },
  {
    icon: <SkipForward className="w-7 h-7" />,
    title: 'Bỏ qua không giới hạn',
    description: 'Bỏ qua bao nhiêu bài tùy thích. Tìm đúng bài bạn muốn nghe.',
  },
  {
    icon: <Volume2 className="w-7 h-7" />,
    title: 'Chất lượng âm thanh cao',
    description: 'Trải nghiệm âm nhạc với chất lượng cao nhất, điều chỉnh theo ý bạn.',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Phiên nghe nhóm',
    description: 'Cùng nghe nhạc theo thời gian thực với bạn bè và gia đình.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-surface-card">
      <div className="max-w-360 mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Tại sao nên dùng Premium?
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Khám phá tất cả lợi ích của LOFIVE Premium
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-surface-elevated border border-border-default hover:border-border-subtle hover:bg-surface-highlight transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
