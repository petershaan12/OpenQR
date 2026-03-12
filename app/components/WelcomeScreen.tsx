import { QrCodeIcon } from "lucide-react";

interface WelcomeScreenProps {
    qr: any;
    showSplash: boolean;
    primaryColor: string;
    displayName: string;
    onVideoEnd?: () => void;
}

export default function WelcomeScreen({ qr, showSplash, primaryColor, displayName, onVideoEnd }: WelcomeScreenProps) {
    if (!showSplash) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center font-sans fixed inset-0 z-50 overflow-hidden" data-theme="light">
            <div
                className={`w-full h-screen max-w-sm flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-700 bg-white ${showSplash ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ backgroundColor: primaryColor }}
            >
                {qr.welcome_video ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <video
                            src={qr.welcome_video}
                            autoPlay
                            playsInline
                            onEnded={onVideoEnd}
                            className="w-full h-full object-cover"
                        />
                        {/* Skip button for video */}
                        <button 
                            onClick={onVideoEnd}
                            className="absolute bottom-10 right-6 bg-black/40 hover:bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 transition-all active:scale-95"
                        >
                            Skip
                        </button>
                    </div>
                ) : (
                    qr.welcome_image && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={qr.welcome_image}
                                alt="Welcome"
                                className="w-36 h-36 object-cover rounded-lg shadow-lg"
                            />
                            {/* Subtle overlay for branding if needed */}
                            <div className="absolute inset-0 bg-black/5" />

                            <div className="absolute bottom-12">
                                <div className="loading loading-ring loading-lg opacity-50 text-white"></div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
