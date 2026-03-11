import { getQRCodeByUniqueId } from "~/services";
import type { Route } from "./+types/vcard-download";

export async function loader({ params }: Route.LoaderArgs) {
    if (!params.id) throw new Response("Not Found", { status: 404 });

    const data = await getQRCodeByUniqueId(params.id);

    if (!data || data.qr.status !== "published") {
        throw new Response("Not Found", { status: 404 });
    }

    const { qr, phones } = data;
    const displayName = `${qr.name || ""} ${qr.surname || ""}`.trim();

    let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
    vcard += `FN:${displayName}\n`;
    vcard += `N:${qr.surname || ""};${qr.name || ""};;;\n`;

    if (qr.title) {
        vcard += `TITLE:${qr.title}\n`;
    }

    if (qr.organization) {
        vcard += `ORG:${qr.organization}\n`;
    }

    phones.forEach((p: any) => {
        if (p.value) {
            vcard += `TEL;TYPE=CELL:${p.value}\n`;
        }
    });

    if (qr.email) {
        vcard += `EMAIL;TYPE=INTERNET:${qr.email}\n`;
    }

    if (qr.social_network) {
        try {
            let social = {};
            if (qr.social_network.startsWith('{') || qr.social_network.startsWith('[')) {
                social = JSON.parse(qr.social_network);
            } else {
                social = { "Website": qr.social_network };
            }

            Object.entries(social).forEach(([key, val]) => {
                if (val) {
                    const url = String(val).startsWith('http') ? val : `https://${val}`;
                    vcard += `URL;TYPE=${key}:${url}\n`;
                }
            });
        } catch (e) {
            const url = String(qr.social_network).startsWith('http') ? qr.social_network : `https://${qr.social_network}`;
            vcard += `URL:${url}\n`;
        }
    }

    if (qr.profile_image && qr.profile_image.startsWith('data:')) {
        const parts = qr.profile_image.split(',');
        const mimeType = parts[0].split(':')[1].split(';')[0];
        const base64Data = parts[1];
        if (base64Data) {
            const type = mimeType.split('/')[1].toUpperCase();
            vcard += `PHOTO;TYPE=${type};ENCODING=b:${base64Data}\n`;
        }
    }

    vcard += `REV:${new Date().toISOString()}\n`;
    vcard += `END:VCARD`;

    return new Response(vcard, {
        headers: {
            "Content-Type": "text/vcard; charset=utf-8",
            "Content-Disposition": `inline; filename="${displayName.replace(/\s+/g, '_')}.vcf"`,
        },
    });
}
