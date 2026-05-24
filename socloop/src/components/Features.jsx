import { BookOpen, Recycle } from "lucide-react";

const features = [
  {
    title: "Smart Redistribution",
    description:
      "Donate books, clothes, school supplies, and useful items to people who need them most.",
    icon: BookOpen,
    tag: "Community Sharing",
  },
  {
    title: "Circular Reuse",
    description:
      "Give unused resources a second life and reduce unnecessary waste inside your community.",
    icon: Recycle,
    tag: "Sustainable Impact",
  },
];

export default function Features() {
  return (
    <section className="relative px-4 sm:px-6 py-24 bg-[#2D142C] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-[#801336]/30 blur-[130px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[#FE4540] uppercase tracking-[0.3em] text-sm mb-4">
            Core Platform
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            Reuse Resources. Empower Communities.
          </h2>

          <p className="mt-5 text-gray-400 max-w-2xl mx-auto leading-relaxed">
            SocLoop connects unused resources with people who need them,
            creating a smarter and more sustainable sharing ecosystem.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="group relative overflow-hidden bg-[#510A32]/70 border border-white/10 rounded-[2rem] p-8 sm:p-10 backdrop-blur-xl hover:border-[#FE4540]/60 transition duration-300"
              >
                {/* Glow Effect */}
                <div className="absolute -right-16 -top-16 w-44 h-44 bg-[#FE4540]/10 rounded-full blur-2xl group-hover:bg-[#FE4540]/20 transition"></div>

                {/* Top */}
                <div className="flex items-center justify-between mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#801336] flex items-center justify-center group-hover:scale-110 transition">
                    <Icon className="text-[#FE4540]" size={34} />
                  </div>

                  <span className="text-xs uppercase tracking-widest text-[#FE4540] bg-[#2D142C]/70 border border-white/10 rounded-full px-4 py-2">
                    {feature.tag}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
