import { useQuery } from "@tanstack/react-query";
import type { DiscordData } from "@shared/schema";

const discordFeatures = [
  {
    icon: "fas fa-users",
    title: "15,000+ Members",
    description: "Active gaming community"
  },
  {
    icon: "fas fa-headset",
    title: "24/7 Support",
    description: "Get help anytime you need it"
  },
  {
    icon: "fas fa-bell",
    title: "Latest Updates",
    description: "Be first to know about new releases"
  },
  {
    icon: "fas fa-gift",
    title: "Exclusive Perks",
    description: "Member-only discounts and giveaways"
  }
];

export default function DiscordSection() {
  const { data: discordData } = useQuery<DiscordData>({
    queryKey: ["/api/discord"]
  });

  const joinDiscord = () => {
    if (discordData?.inviteUrl) {
      window.open(discordData.inviteUrl, '_blank');
    }
  };

  const copyReferralCode = async () => {
    if (discordData?.referralCode) {
      try {
        await navigator.clipboard.writeText(discordData.referralCode);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy referral code:', err);
      }
    }
  };

  return (
    <section id="discord" className="py-20 bg-gradient-to-r from-[#5865F2] to-[#7289DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Join Our Community
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Connect with fellow gamers, get support, share tips, and stay updated with the latest releases. 
            Our Discord community is the hub for all Kernal.wtf users.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Discord Info */}
          <div className="space-y-8">
            {discordFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className={`${feature.icon} text-2xl text-white`}></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Discord Widget */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <i className="fab fa-discord text-6xl text-white mb-4"></i>
              <h3 className="text-2xl font-bold text-white mb-2">Kernal.wtf Official</h3>
              <p className="text-white/80">Join our Discord server</p>
            </div>
            
            {discordData && (
              <div className="space-y-4 mb-6 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>🟢 Online</span>
                  <span>{discordData.onlineCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>👥 Members</span>
                  <span>{discordData.memberCount}</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={joinDiscord}
              className="w-full bg-white text-[#5865F2] py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
            >
              <i className="fab fa-discord mr-2"></i>Join Server
            </button>
            
            {/* Referral Code */}
            {discordData?.referralCode && (
              <div className="mt-4 p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-white/60 mb-1">Referral Code:</p>
                <div className="flex items-center justify-between">
                  <code className="text-white font-mono">{discordData.referralCode}</code>
                  <button 
                    onClick={copyReferralCode}
                    className="text-white/80 hover:text-white"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
