import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    User,
    Phone,
    Mail,
    Globe,
    Plus,
} from "lucide-react";
import { socialOptions } from "~/components/shared/SocialIcons";
import WelcomeScreen from "~/components/WelcomeScreen";

export default function PublicCard() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    // Derived values - safe to compute even when data is null
    const qr = data?.qr || {};
    const phones = data?.phones || [];
    const hasVideo = qr.welcome_video && qr.welcome_video.length > 0;
    const displayName = `${qr.name || ""} ${qr.surname || ""}`.trim();
    const primaryColor = qr.primary_color || '#DC2626';

    const socialLinks = useMemo(() => {
        if (!qr.social_network) return {};
        try {
            if (qr.social_network.startsWith('{') || qr.social_network.startsWith('[')) {
                return JSON.parse(qr.social_network);
            }
            return { "Website": qr.social_network };
        } catch (e) {
            return { "Website": qr.social_network || "" };
        }
    }, [qr.social_network]);

    const activeSocialLinks = useMemo(() =>
        Object.entries(socialLinks).filter(([_, val]) => val),
        [socialLinks]
    );

    const handleSplashEnd = useCallback(() => {
        setShowSplash(false);
    }, []);

    const downloadVCard = useCallback(() => {
        if (qr.unique_id) {
            window.location.href = `/${qr.unique_id}/vcard`;
        }
    }, [qr.unique_id]);

    // Fetch data
    useEffect(() => {
        if (!id) {
            setError(true);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "/php-backend/api.php";

                const response = await fetch(`${API_URL}?path=/qrcodes/public/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setError(true);
                        setLoading(false);
                        return;
                    }
                    throw new Error("Failed to load QR code data");
                }

                const result = await response.json();

                if (!result || result.qr.status !== "published") {
                    setError(true);
                    setLoading(false);
                    return;
                }

                // Increment scan count
                fetch(`${API_URL}?path=/qrcodes/${id}/increment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }).catch(() => {}); // Fire and forget

                // Determine if splash should show
                const qrData = result.qr;
                const hasVideoContent = qrData.welcome_video && qrData.welcome_video.length > 0;
                const shouldShowSplash = qrData.enable_welcome !== 0 && (qrData.welcome_screen_time > 0 || hasVideoContent);

                setShowSplash(shouldShowSplash);
                setData(result);
                setLoading(false);
            } catch (error) {
                console.error("Error loading public card data:", error);
                setError(true);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Splash screen timeout
    useEffect(() => {
        if (!data || !showSplash) return;

        // Only trigger timeout if there's NO video but splash is enabled
        if (qr.enable_welcome !== 0 && qr.welcome_screen_time > 0 && !hasVideo) {
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, qr.welcome_screen_time * 1000);
            return () => clearTimeout(timer);
        }
    }, [data, showSplash, qr.enable_welcome, qr.welcome_screen_time, hasVideo]);

    // Conditional renders AFTER all hooks
    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Not Found</h1>
                    <p className="text-gray-500">The requested QR code could not be found.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-base-100 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-red-600"></span>
            </div>
        );
    }

    if (showSplash && data) {
        return (
            <WelcomeScreen
                qr={qr}
                showSplash={showSplash}
                primaryColor={primaryColor}
                displayName={displayName}
                onVideoEnd={handleSplashEnd}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center font-sans" data-theme="light">
            <div className="w-full h-screen md:max-w-sm bg-base-100 flex flex-col relative">
                <div className="flex-1 flex flex-col overflow-y-auto">

                    {/* Hero Photo */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                        {qr.profile_image ? (
                            <img
                                src={qr.profile_image}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                                <User className="w-24 h-24" style={{ color: `${primaryColor}40` }} />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    {/* Name & Title */}
                    <div className="px-6 -mt-2 relative z-10">
                        <h1 className="text-xl font-bold leading-tight">
                            {displayName}
                        </h1>
                        <p className="text-gray-400 text-lg mt-0" style={{ fontFamily: "'MonteCarlo', cursive", color: primaryColor }}>
                            {qr.title || 'Title'}
                        </p>
                    </div>

                    {/* Add Contact Button */}
                    <div className="px-6 mt-5">
                        <button
                            onClick={downloadVCard}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-full font-bold text-sm border-2 transition-all hover:brightness-110 active:scale-95"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Plus className="w-4 h-4" strokeWidth={3} />
                            Add Contact
                        </button>
                    </div>

                    {/* Contact Info */}
                    <div className="px-6 mt-8 space-y-6">
                        {phones.map((p: any, i: number) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                                    <Phone className="w-5 h-5" strokeWidth={2} />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-sm font-bold text-gray-800">Phone</p>
                                    <a href={`tel:${p.value}`} className="block text-sm text-gray-500 hover:text-gray-800 transition-colors">{p.value}</a>
                                </div>
                            </div>
                        ))}

                        {qr.email && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                                    <Mail className="w-5 h-5" strokeWidth={2} />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-sm font-bold text-gray-800">Email</p>
                                    <a href={`mailto:${qr.email}`} className="block text-sm text-gray-500 hover:text-gray-800 transition-colors">{qr.email}</a>
                                </div>
                            </div>
                        )}

                        {socialLinks['Website'] && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                                    <Globe className="w-5 h-5" strokeWidth={2} />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-sm font-bold text-gray-800">Website</p>
                                    <a
                                        href={socialLinks['Website'].startsWith('http') ? socialLinks['Website'] : `https://${socialLinks['Website']}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-sm text-gray-500 hover:text-gray-800 transition-colors"
                                    >
                                        {socialLinks['Website'].replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1" />

                    {/* Footer */}
                    <div className="text-center py-6">
                        <div className="flex justify-center gap-4 mt-10 mb-4">
                            {activeSocialLinks.filter(([k]) => k.toLowerCase() !== 'website').map(([key, val], i) => {
                                const option = socialOptions.find(o => o.name.toLowerCase() === key.toLowerCase());
                                if (!option) return null;
                                return (
                                    <a
                                        key={i}
                                        href={val.startsWith('http') ? val : `https://${val}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-all hover:scale-110 active:scale-95"
                                    >
                                        <img src={option.icon} alt={key} className="w-7 h-7 object-contain" />
                                    </a>
                                );
                            })}
                        </div>
                        <p className="text-[11px] text-gray-400">{qr.legal_info || "© YYYY Company Name. All Rights Reserved."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
