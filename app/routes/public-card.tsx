import { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import {
    User,
    Phone,
    Mail,
    Globe,
    Plus,
    QrCode as QrCodeIcon,
} from "lucide-react";
import { socialOptions } from "~/components/shared/SocialIcons";
import { getQRCodeByUniqueId, incrementScans } from "~/services";
import type { Route } from "./+types/public-card";
import WelcomeScreen from "~/components/WelcomeScreen";

export async function loader({ params }: Route.LoaderArgs) {
    if (!params.id) throw new Response("Not Found", { status: 404 });

    const data = await getQRCodeByUniqueId(params.id);

    if (!data || data.qr.status !== "published") {
        throw new Response("Not Found", { status: 404 });
    }

    await incrementScans(params.id);

    return data;
}



function generateVCard(qr: any, phones: any[]) {
    const displayName = `${qr.name || ""} ${qr.surname || ""}`.trim();
    let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
    vcard += `FN:${displayName}\n`;
    vcard += `N:${qr.surname || ""};${qr.name || ""};;;\n`;

    if (qr.title) {
        vcard += `TITLE:${qr.title}\n`;
    }

    phones.forEach((p: any) => {
        if (p.value) {
            vcard += `TEL;TYPE=CELL:${p.value}\n`;
        }
    });

    if (qr.email) {
        vcard += `EMAIL:${qr.email}\n`;
    }

    if (qr.social_network) {
        try {
            const social = JSON.parse(qr.social_network);
            Object.entries(social).forEach(([key, val]) => {
                if (val) vcard += `URL;TYPE=${key}:${val}\n`;
            });
        } catch (e) {
            vcard += `URL:${qr.social_network}\n`;
        }
    }

    if (qr.profile_image && qr.profile_image.startsWith('data:')) {
        const base64Data = qr.profile_image.split(',')[1];
        if (base64Data) {
            vcard += `PHOTO;ENCODING=b;TYPE=JPEG:${base64Data}\n`;
        }
    }

    vcard += `END:VCARD`;
    return vcard;
}

function downloadVCard(qr: any, phones: any[]) {
    const vcard = generateVCard(qr, phones);
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const displayName = `${qr.name || ""} ${qr.surname || ""}`.trim();
    link.href = url;
    link.download = `${displayName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function PublicCard() {
    const { qr, phones } = useLoaderData<any>();
    const [showSplash, setShowSplash] = useState(qr.enable_welcome !== 0 && qr.welcome_screen_time > 0);
    const displayName = `${qr.name || ""} ${qr.surname || ""}`.trim();
    const primaryColor = qr.primary_color || '#DC2626';

    useEffect(() => {
        if (qr.enable_welcome !== 0 && qr.welcome_screen_time > 0) {
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, qr.welcome_screen_time * 1000);
            return () => clearTimeout(timer);
        }
    }, [qr.welcome_screen_time]);

    let socialLinks: Record<string, string> = {};
    try {
        if (qr.social_network && (qr.social_network.startsWith('{') || qr.social_network.startsWith('['))) {
            socialLinks = JSON.parse(qr.social_network);
        } else if (qr.social_network) {
            socialLinks = { "Website": qr.social_network };
        }
    } catch (e) {
        socialLinks = { "Website": qr.social_network || "" };
    }

    const activeSocialLinks = Object.entries(socialLinks).filter(([_, val]) => val);

    if (showSplash) {
        return <WelcomeScreen qr={qr} showSplash={showSplash} primaryColor={primaryColor} displayName={displayName} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center font-sans" data-theme="light">
            <div className="w-full h-screen md:max-w-sm bg-base-100 flex flex-col relative">
                <div className="flex-1 flex flex-col overflow-y-auto">

                    {/* Hero Photo — large, no overlay */}
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
                        {/* Subtle gradient at bottom of photo */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    {/* Name & Title — left aligned */}
                    <div className="px-6 -mt-2 relative z-10">
                        <h1 className="text-xl font-bold leading-tight">
                            {displayName}
                        </h1>
                        <p className="text-gray-400 text-lg mt-0" style={{ fontFamily: "'MonteCarlo', cursive", color: primaryColor }}>{qr.title || 'Title'}</p>
                    </div>

                    {/* Add Contact Button — outlined */}
                    <div className="px-6 mt-5">
                        <button
                            onClick={() => downloadVCard(qr, phones)}
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

                        {/* Website row in contact info */}
                        {socialLinks['Website'] && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                                    <Globe className="w-5 h-5" strokeWidth={2} />
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <p className="text-sm font-bold text-gray-800">Website</p>
                                    <a href={socialLinks['Website'].startsWith('http') ? socialLinks['Website'] : `https://${socialLinks['Website']}`} target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-500 hover:text-gray-800 transition-colors">{socialLinks['Website'].replace(/^https?:\/\//, '')}</a>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Spacer to push footer down */}
                    <div className="flex-1" />

                    {/* Footer — pinned at bottom */}
                    <div className="text-center py-6">
                        {/* Social Icons — exclude Website */}
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
                        <p className="text-[11px] text-gray-400">{qr.legal_info || "E.g. © YYYY Company Name. All Rights Reserved."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}