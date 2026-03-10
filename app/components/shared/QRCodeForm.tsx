import { useState, useEffect } from "react";
import { Form, useNavigate, useSearchParams, useNavigation, useActionData } from "react-router";
import {
    Upload,
    Plus,
    Check,
    QrCode,
    Copy,
    Download,
    AlertCircle,
    Link as LinkIcon,
    MessageCircle,
    X as XIcon,
    Phone,
    Globe,
    Trash2,
    Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { type ThemeData as Theme, type PhoneInput, type QRCodeFormData as FormData } from "~/types";
import { socialOptions } from "./SocialIcons";
import PhonePreview from "./PhonePreview";
import { validateSocialLink, getPlatformPlaceholder } from "~/utils/validation";

interface QRCodeFormProps {
    mode: 'create' | 'edit';
    themes: Theme[];
    initialQRCode?: any;
    user: any;
}

export default function QRCodeForm({ mode, themes, initialQRCode, user }: QRCodeFormProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState<number>(searchParams.get("step") === "2" ? 2 : 1);
    const [profileImage, setProfileImage] = useState<string | null>(initialQRCode?.profile_image || null);

    const [phoneInputs, setPhoneInputs] = useState<PhoneInput[]>(
        initialQRCode?.phones?.length > 0
            ? initialQRCode.phones.map((p: any) => ({ id: p.id, value: p.phone }))
            : [{ id: 1, value: "" }]
    );
    const [emailInputs, setEmailInputs] = useState<string[]>(
        initialQRCode?.email ? [initialQRCode.email] : [""]
    );
    const [selectedSocial, setSelectedSocial] = useState<string>("Instagram");
    const [error, setError] = useState<string | null>(null);
    const actionData = useActionData<any>();

    const navigation = useNavigation();
    const isSubmitting = navigation.state !== "idle";
    const [showToast, setShowToast] = useState(false);
    const [lastSavedData, setLastSavedData] = useState<any>(initialQRCode);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const copyToClipboard = (text: string) => {
        if (typeof window !== 'undefined') {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    setShowToast(true);
                }).catch(() => {
                    // Fallback
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setShowToast(true);
                });
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setShowToast(true);
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }
                document.body.removeChild(textArea);
            }
        }
    };

    // Use black for QR code as requested
    const qrColor = "#000000";

    // Parse initial social network
    const getInitialSocialLinks = () => {
        try {
            if (initialQRCode?.social_network && (initialQRCode.social_network.startsWith('{') || initialQRCode.social_network.startsWith('['))) {
                return JSON.parse(initialQRCode.social_network);
            } else if (initialQRCode?.social_network) {
                return { "Website": initialQRCode.social_network };
            }
        } catch (e) { }
        return {};
    };

    const [socialLinks, setSocialLinks] = useState<Record<string, string>>(getInitialSocialLinks());
    const [currentSocialValue, setCurrentSocialValue] = useState("");

    // Effect to initialize currentSocialValue from socialLinks
    useEffect(() => {
        if (socialLinks[selectedSocial]) {
            setCurrentSocialValue(socialLinks[selectedSocial]);
        } else {
            setCurrentSocialValue("");
        }
    }, [selectedSocial, socialLinks]);

    // Effect to handle action success
    useEffect(() => {
        if (actionData?.success) {
            setShowToast(true);
            // On success, update lastSavedData to current state
            setLastSavedData({
                ...formData,
                profile_image: profileImage,
                phones: phoneInputs.map(p => ({ phone: p.value })),
                email: emailInputs[0], // Simplified assuming first email is main
                social_network: JSON.stringify(socialLinks)
            });
        }
    }, [actionData]);

    const [formData, setFormData] = useState<FormData & { status: string }>({
        name: initialQRCode?.name || "",
        surname: initialQRCode?.surname || "",
        title: initialQRCode?.title || "",
        email: initialQRCode?.email || "",
        social_network: initialQRCode?.social_network || "{}",
        theme_id: initialQRCode?.theme_id || (themes[0]?.id || ""),
        status: initialQRCode?.status || "draft",
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, social_network: JSON.stringify(socialLinks) }));
    }, [socialLinks]);

    // Check if form is dirty
    const isDirty = (
        (formData.name || "") !== (lastSavedData?.name || "") ||
        (formData.surname || "") !== (lastSavedData?.surname || "") ||
        (formData.title || "") !== (lastSavedData?.title || "") ||
        (formData.theme_id || "") !== (lastSavedData?.theme_id || "") ||
        (formData.status || "draft") !== (lastSavedData?.status || "draft") ||
        (profileImage || null) !== (lastSavedData?.profile_image || null) ||
        JSON.stringify(phoneInputs.map(p => ({ phone: p.value }))) !== JSON.stringify(lastSavedData?.phones?.map((p: any) => ({ phone: p.phone })) || [{ phone: "" }]) ||
        (emailInputs[0] || "") !== (lastSavedData?.email || "") ||
        JSON.stringify(socialLinks) !== (lastSavedData?.social_network && (lastSavedData.social_network.startsWith('{') || lastSavedData.social_network.startsWith('[')) ? lastSavedData.social_network : JSON.stringify({ "Website": lastSavedData?.social_network || "" }))
    );

    const selectedTheme =
        themes.find((t: any) => String(t.id) === String(formData.theme_id)) || themes[0];

    const primaryColor = selectedTheme?.primary_color || "#dc2626";

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setProfileImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleNextStep = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!formData.name.trim() || !formData.surname.trim() || !formData.title.trim()) {
            setError("First Name, Last Name, and Job Title are required.");
            return;
        }
        // Social validation
        for (const [platform, url] of Object.entries(socialLinks)) {
            if (url && !validateSocialLink(platform, url)) {
                setError(`Invalid ${platform} link. Please check the format.`);
                return;
            }
        }

        const hasPhone = phoneInputs.some(p => p.value.trim() !== "");
        const hasEmail = emailInputs.some(e => e.trim() !== "");
        if (!hasPhone && !hasEmail) {
            setError("At least one Phone Number or Email is required.");
            return;
        }
        setError(null);
        setStep(2);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
            {/* Toast Notification */}
            {showToast && (
                <div className="toast toast-top toast-center z-[100] animate-in slide-in-from-top duration-300">
                    <div className="alert alert-success shadow-lg border-none bg-success text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        <span>{actionData?.success ? "Changes saved successfully!" : "Link copied to clipboard!"}</span>
                    </div>
                </div>
            )}
            {/* Left Content (3/4) */}
            <div className="lg:w-3/4 pb-20 w-full">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${step >= 1 ? "bg-base-100 shadow-sm border-[#dc2626] text-[#dc2626]" : "border-base-300 text-base-content/30"}`}
                        >
                            1
                        </div>
                        <div className="w-12 h-[2px] bg-base-300" />
                        <div
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${step >= 2 ? "bg-base-100 shadow-sm border-[#dc2626] text-[#dc2626]" : "border-base-300 text-base-content/30"}`}
                        >
                            2
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')}
                            className="btn btn-ghost font-bold"
                            disabled={isSubmitting}
                        >
                            {step === 2 ? "Back" : "Cancel"}
                        </button>

                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="btn-army px-6"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                            </button>
                        ) : (
                            <button
                                form="qrcode-form"
                                type="submit"
                                name="_action"
                                value={mode === 'create' ? "create_qrcode" : "update_qrcode"}
                                className="btn-army px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting || !isDirty}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        {mode === 'create' ? "Publish QR Code" : (formData.status === "published" ? "Publish Changes" : "Save Draft")}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <Form
                    id="qrcode-form"
                    method="post"
                    className="space-y-6"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                            e.preventDefault();
                        }
                    }}
                >
                    <input type="hidden" name="profile_image_data" value={profileImage || ""} />
                    <input type="hidden" name="social_network" value={formData.social_network} />

                    {step !== 1 && (
                        <>
                            <input type="hidden" name="name" value={formData.name} />
                            <input type="hidden" name="surname" value={formData.surname} />
                            <input type="hidden" name="title" value={formData.title} />
                            <input type="hidden" name="theme_id" value={formData.theme_id} />
                            {phoneInputs.map((p, i) => (
                                <input key={`hphone-${i}`} type="hidden" name="phones[]" value={p.value} />
                            ))}
                            {emailInputs.map((e, i) => (
                                <input key={`hemail-${i}`} type="hidden" name="emails[]" value={e} />
                            ))}
                        </>
                    )}

                    {step === 1 ? (
                        <div className="space-y-6">
                            {error && (
                                <div className="alert alert-error font-bold rounded-lg text-sm">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            {/* Section: Select Theme */}
                            <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-base-300 bg-base-200/50">
                                    <h3 className="font-bold text-base-content">Theme Style</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {themes.map((t: any) => (
                                            <label
                                                key={t.id}
                                                className={`cursor-pointer group relative rounded-lg border-2 p-1 transition-all ${formData.theme_id == t.id ? "" : "border-base-300 bg-base-200/20"}`}
                                                style={formData.theme_id == t.id ? { borderColor: t.primary_color, backgroundColor: `${t.primary_color}08` } : {}}
                                            >
                                                <input
                                                    type="radio"
                                                    name="theme_id"
                                                    value={t.id}
                                                    className="hidden"
                                                    checked={String(formData.theme_id) === String(t.id)}
                                                    onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
                                                />
                                                <div className="p-4 flex flex-col items-center">
                                                    <span className={`font-bold mb-3 ${formData.theme_id == t.id ? "text-base-content" : "text-base-content/40"}`}>{t.name}</span>
                                                    <div className="w-5 h-5 rounded-full border-2 border-base-100 ring-2 ring-base-300" style={{ backgroundColor: t.primary_color }} />
                                                </div>
                                                {formData.theme_id == t.id && (
                                                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full text-white shadow-md animate-in zoom-in" style={{ backgroundColor: t.primary_color }}>
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Section: Basic Information */}
                            <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-base-300 bg-base-200/50">
                                    <h3 className="font-bold text-base-content">Personal Details</h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Photo Upload */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative shrink-0">
                                            {profileImage ? (
                                                <img src={profileImage} className="w-20 h-20 rounded-lg object-cover ring-2 ring-base-300 shadow-sm" alt="Preview" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-lg bg-base-200 flex items-center justify-center border-2 border-dashed border-base-300">
                                                    <Upload className="w-6 h-6 text-base-content/20" />
                                                </div>
                                            )}
                                            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-base-100 text-base-content shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all border border-base-300">
                                                <Plus className="w-4 h-4" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold">Profile Picture</p>
                                            <p className="text-sm text-base-content/50">PNG or JPG, square recommended</p>
                                        </div>
                                    </div>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text font-bold text-base-content/70">First Name <span className="text-error font-extrabold ml-1">*</span></span>
                                            </label>
                                            <input
                                                name="name"
                                                type="text"
                                                className="input input-bordered w-full font-medium"
                                                placeholder="Your first name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label py-1">
                                                <span className="label-text font-bold text-base-content/70">Last Name <span className="text-error font-extrabold ml-1">*</span></span>
                                            </label>
                                            <input
                                                name="surname"
                                                type="text"
                                                className="input input-bordered w-full font-medium"
                                                placeholder="Your last name"
                                                value={formData.surname}
                                                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label py-1">
                                            <span className="label-text font-bold text-base-content/70">Job Title <span className="text-error font-extrabold ml-1">*</span></span>
                                        </label>
                                        <input
                                            name="title"
                                            type="text"
                                            className="input input-bordered w-full font-medium"
                                            placeholder="CEO / Consultant / Freelancer"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {/* Dynamic Phones */}
                                    <div className="space-y-2">
                                        <label className="label">
                                            <span className="label-text font-bold text-base-content/70">Phone Numbers</span>
                                        </label>
                                        {phoneInputs.map((p, idx) => (
                                            <div key={p.id} className="flex gap-2">
                                                <div className="join w-full">
                                                    <div className="join-item bg-base-200 border border-base-300 flex items-center px-4">
                                                        <Phone className="w-4 h-4 text-base-content/30" />
                                                    </div>
                                                    <input
                                                        name="phones[]"
                                                        type="tel"
                                                        className="input input-bordered join-item flex-1 font-medium"
                                                        placeholder="+123 456 789"
                                                        value={p.value}
                                                        onChange={(e) => {
                                                            const newPhones = [...phoneInputs];
                                                            newPhones[idx].value = e.target.value;
                                                            setPhoneInputs(newPhones);
                                                        }}
                                                    />
                                                </div>
                                                {idx === phoneInputs.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPhoneInputs([...phoneInputs, { id: Date.now(), value: "" }])}
                                                        className="btn btn-square"
                                                        style={{ backgroundColor: primaryColor, color: 'white', border: 'none' }}
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPhoneInputs(phoneInputs.filter(item => item.id !== p.id))}
                                                        className="btn btn-ghost btn-square text-error"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="label">
                                            <span className="label-text font-bold text-base-content/70">Emails</span>
                                        </label>
                                        {emailInputs.map((email, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <div className="join w-full">
                                                    <div className="join-item bg-base-200 border border-base-300 flex items-center px-4">
                                                        <MessageCircle className="w-4 h-4 text-base-content/30" />
                                                    </div>
                                                    <input
                                                        name="emails[]"
                                                        type="email"
                                                        className="input input-bordered join-item flex-1 font-medium"
                                                        placeholder="you@example.com"
                                                        value={email}
                                                        onChange={(e) => {
                                                            const newEmails = [...emailInputs];
                                                            newEmails[idx] = e.target.value;
                                                            setEmailInputs(newEmails);
                                                        }}
                                                    />
                                                </div>
                                                {idx === emailInputs.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmailInputs([...emailInputs, ""])}
                                                        className="btn btn-square"
                                                        style={{ backgroundColor: primaryColor, color: 'white', border: 'none' }}
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmailInputs(emailInputs.filter((_, i) => i !== idx))}
                                                        className="btn btn-ghost btn-square text-error"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Website — now part of contact info */}
                                    <div className="space-y-2">
                                        <label className="label">
                                            <span className="label-text font-bold text-base-content/70">Website</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="join w-full">
                                                <div className="join-item bg-base-200 border border-base-300 flex items-center px-4">
                                                    <Globe className="w-4 h-4 text-base-content/30" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="input input-bordered join-item flex-1 font-medium"
                                                    placeholder="https://yourwebsite.com"
                                                    value={socialLinks['Website'] || ''}
                                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, Website: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Digital Content */}
                            <section className="bg-base-100 border border-base-300 rounded-lg overflow-hidden shadow-sm">
                                <div className="px-5 py-3 border-b border-base-300 bg-base-200/50">
                                    <h3 className="font-bold text-base-content">Social Links</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex flex-wrap gap-2">
                                        {socialOptions.map((social) => (
                                            <button
                                                key={social.name}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSocial(social.name);
                                                    setCurrentSocialValue(socialLinks[social.name] || "");
                                                }}
                                                className={`btn btn-sm gap-2 font-bold normal-case rounded-lg border-2 ${selectedSocial === social.name ? 'border-primary bg-primary/5' : 'btn-ghost border-transparent'}`}
                                                style={selectedSocial === social.name ? { borderColor: primaryColor } : {}}
                                            >
                                                <img src={social.icon} alt={social.name} className="w-5 h-5 object-contain" />
                                                {social.name}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="form-control">
                                        <div className="join w-full shadow-sm">
                                            <div className="join-item bg-base-200 border border-base-300 px-4 flex items-center">
                                                <LinkIcon className="w-4 h-4 text-base-content/30" />
                                            </div>
                                            <input
                                                type="text"
                                                className="input input-bordered join-item flex-1 font-medium"
                                                placeholder={getPlatformPlaceholder(selectedSocial)}
                                                value={currentSocialValue}
                                                onChange={(e) => {
                                                    setCurrentSocialValue(e.target.value);
                                                    setSocialLinks(prev => ({ ...prev, [selectedSocial]: e.target.value }));
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-base-content/40 mt-2 font-medium italic">
                                            Select a platform above and type your link. It will be added to your profile.
                                        </p>
                                    </div>

                                    {/* Show added links */}
                                    {Object.entries(socialLinks).filter(([key, val]) => val && key !== 'Website').length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {Object.entries(socialLinks).filter(([key, val]) => val && key !== 'Website').map(([key, val]) => {
                                                const option = socialOptions.find(o => o.name === key);
                                                return (
                                                    <div key={key} className="badge badge-lg py-4 pl-1 pr-3 gap-2 bg-base-200 border-base-300 rounded-lg group">
                                                        {option && <img src={option.icon} alt={key} className="w-4 h-4 object-contain" />}
                                                        <span className="text-xs font-bold text-base-content/70">{key}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSocialLinks(prev => {
                                                                const next = { ...prev };
                                                                delete next[key];
                                                                if (key === selectedSocial) setCurrentSocialValue("");
                                                                return next;
                                                            })}
                                                            className="hover:text-error transition-colors ml-1"
                                                        >
                                                            <XIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto space-y-6">
                            <div className="bg-base-100 border border-base-300 rounded-lg p-10 flex flex-col items-center text-center shadow-lg">
                                <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <QrCode className="w-8 h-8" style={{ color: primaryColor }} />
                                </div>
                                <h3 className="font-bold text-xl mb-1 text-base-content">QR Code Preview</h3>
                                <p className="text-sm text-base-content/50 font-medium mb-8">Review your digital card before saving</p>

                                <div className="bg-white p-6 rounded-lg shadow-inner mb-8 border" style={{ borderColor: `${primaryColor}20` }}>
                                    {initialQRCode?.unique_id ? (
                                        <ClientOnlyQRCode
                                            uniqueId={initialQRCode.unique_id}
                                            themeColor={qrColor}
                                        />
                                    ) : (
                                        <div className="w-44 h-44 flex flex-col items-center justify-center text-center p-4">
                                            <div className="w-12 h-12 bg-base-200 rounded-lg flex items-center justify-center mb-3">
                                                <QrCode className="w-6 h-6 text-base-content/20" />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">
                                                QR Code will be generated<br />after you <span className="text-primary">Publish</span> or <span className="text-primary">Save</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {initialQRCode?.unique_id ? (
                                    <div className="flex flex-col gap-2 w-full">
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(`${window.location.origin}/${initialQRCode.unique_id}`)}
                                            className="btn btn-ghost bg-base-200 border border-base-300 h-14 rounded-lg flex flex-col items-center justify-center p-0"
                                        >
                                            <span className="text-[10px] font-bold text-base-content/40 uppercase">Live Access URL</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base-content truncate max-w-[200px]">{window.location.host}/{initialQRCode.unique_id}</span>
                                                <Copy className="w-4 h-4 text-base-content/40" />
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => downloadQRCode(initialQRCode.unique_id, formData.name)}
                                            className="btn btn-ghost border border-base-300 h-14 rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            <span className="font-bold">Download PNG</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase text-center italic">
                                            Actions will be available after saving
                                        </p>
                                    </div>
                                )}

                                <div className="w-full mt-6 flex items-center justify-between p-4 bg-base-200 border border-base-300 rounded-lg">
                                    <div className="text-left">
                                        <p className="font-bold text-base-content">QR Code Status</p>
                                        <p className="text-xs text-base-content/60">Must be active to be scannable.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-base-content/60">{formData.status === 'published' ? 'Active' : 'Draft'}</span>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-success"
                                            checked={formData.status === "published"}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.checked ? "published" : "draft" })}
                                        />
                                        <input type="hidden" name="status" value={formData.status} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Form>
            </div>

            {/* Right Sidebar - Phone Preview (1/4) */}
            <div className="hidden lg:block lg:w-1/4 sticky top-1">
                <div className="flex flex-col items-center space-y-4">
                    <PhonePreview
                        profileImage={profileImage}
                        name={formData.name}
                        surname={formData.surname}
                        title={formData.title}
                        emails={emailInputs}
                        phones={phoneInputs}
                        socialNetwork={formData.social_network}
                        legalInfo={selectedTheme?.legal_info}
                        primaryColor={primaryColor}
                    />
                </div>
            </div>
        </div>
    );
}

function ClientOnlyQRCode({ uniqueId, themeColor }: { uniqueId: string, themeColor: string }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-44 h-44 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg" style={{ color: themeColor }}></span>
            </div>
        );
    }

    return (
        <QRCodeSVG
            id="qr-code-svg"
            value={`${window.location.origin}/${uniqueId}`}
            size={180}
            bgColor="#FFFFFF"
            fgColor={themeColor}
            level="H"
            includeMargin={false}
        />
    );
}

function downloadQRCode(uniqueId: string, name: string) {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width * 4;
        canvas.height = img.height * 4;
        if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `QR-${name.replace(/\s+/g, '-')}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
}
