import React from "react";
import {
    Phone,
    Mail,
    Globe,
    Plus,
    User,
} from "lucide-react";
import { socialOptions } from "~/components/shared/SocialIcons";

import { type PhoneInput } from "~/types";

interface PhonePreviewProps {
    profileImage?: string | null;
    name?: string;
    surname?: string;
    title?: string;
    emails?: string[];
    phones?: PhoneInput[];
    socialNetwork?: string;
    legalInfo?: string;
    primaryColor?: string;
}

const PhonePreview: React.FC<PhonePreviewProps> = ({
    profileImage,
    name,
    surname,
    title,
    emails = [],
    phones = [],
    socialNetwork,
    legalInfo,
    primaryColor = "#dc2626", // Default red-600
}) => {
    const displayName = `${name || ""} ${surname || ""}`.trim() || "Full Name";
    const headerBgStyle = {
        background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor}dd)`
    };

    // Parse social network JSON or handle plain string
    let socialLinks: Record<string, string> = {};
    try {
        if (socialNetwork && (socialNetwork.startsWith('{') || socialNetwork.startsWith('['))) {
            socialLinks = JSON.parse(socialNetwork);
        } else if (socialNetwork) {
            socialLinks = { "Website": socialNetwork };
        }
    } catch (e) {
        socialLinks = { "Website": socialNetwork || "" };
    }

    const activeSocialLinks = Object.entries(socialLinks).filter(([_, val]) => val);

    return (
        <div className="phone-mockup w-[280px] mx-auto sticky top-4">
            <div className="phone-screen h-[520px] flex flex-col relative bg-white rounded-[2rem] overflow-hidden border-[6px] border-black shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-8 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">

                    {/* Hero Photo — large, matching public card */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden shrink-0">
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                                <User className="w-16 h-16" style={{ color: `${primaryColor}40` }} />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    {/* Name & Title — left aligned */}
                    <div className="px-4 -mt-1 relative z-10">
                        <h2 className="text-gray-900 text-sm font-bold leading-tight">
                            {displayName}
                        </h2>
                        <p className="text-gray-400 text-sm mt-0" style={{ color: primaryColor }}>
                            {title || "Position Title"}
                        </p>
                    </div>

                    {/* Add Contact Button — outlined */}
                    <div className="px-4 mt-3">
                        <button
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[10px] border-2 transition-transform active:scale-95"
                            style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: 'transparent' }}
                        >
                            <Plus className="w-3 h-3" strokeWidth={3} />
                            Add Contact
                        </button>
                    </div>

                    {/* Contact Info */}
                    <div className="px-4 mt-4 space-y-3">
                        {phones.filter(p => p.value).map((phone, i) => (
                            <div key={phone.id || i} className="flex items-start gap-2.5">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                                    <Phone className="w-3 h-3" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[8px] font-bold text-gray-700">Phone</p>
                                    <p className="text-[10px] text-gray-500 truncate w-40">{phone.value}</p>
                                </div>
                            </div>
                        ))}

                        {emails.filter(e => e).map((email, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                                    <Mail className="w-3 h-3" strokeWidth={2} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[8px] font-bold text-gray-700">Email</p>
                                    <p className="text-[10px] text-gray-500 truncate w-40">{email}</p>
                                </div>
                            </div>
                        ))}

                        {/* Website row in contact info */}
                        {(() => {
                            const websiteEntry = activeSocialLinks.find(([k]) => k.toLowerCase() === 'website');
                            if (!websiteEntry) return null;
                            const [, val] = websiteEntry;
                            const displayUrl = val.replace(/^https?:\/\//, '');
                            return (
                                <div className="flex items-start gap-2.5">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                                        <Globe className="w-3 h-3" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-bold text-gray-700">Website</p>
                                        <p className="text-[10px] text-gray-500 truncate w-40">{displayUrl}</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Footer */}
                    <div className="text-center py-3">
                        {/* Social Icons — exclude Website */}
                        <div className="flex justify-center flex-wrap gap-2 mt-6 pb-2">
                            {activeSocialLinks.filter(([k]) => k.toLowerCase() !== 'website').map(([key, _], i) => {
                                const option = socialOptions.find(o => o.name.toLowerCase() === key.toLowerCase());
                                return option ? (
                                    <div
                                        key={i}
                                        className="transition-all hover:scale-110"
                                        title={key}
                                    >
                                        <img src={option.icon} alt={key} className="w-6 h-6 object-contain" />
                                    </div>
                                ) : null;
                            })}
                            {activeSocialLinks.filter(([k]) => k.toLowerCase() !== 'website').length === 0 && (
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center opacity-20">
                                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <p className="text-gray-600 text-[7px]">
                            {legalInfo || "E.g. © YYYY Company Name. All Rights Reserved."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhonePreview;
