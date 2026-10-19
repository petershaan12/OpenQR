import type { LoaderFunctionArgs } from "react-router";
import { getQRCodeByUniqueId } from "~/services";

export async function loader({ params }: LoaderFunctionArgs) {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });

    const data = await getQRCodeByUniqueId(id);

    if (!data || data.qr.status !== "published") {
        throw new Response("Not Found", { status: 404 });
    }

    const { qr, phones } = data;
    const displayName = `${qr.name || ""} ${qr.surname || ""}`.trim();

    // RFC 6350 text escaping; also stops CR/LF from injecting extra properties
    const esc = (v: unknown) => String(v ?? "").replace(/\\/g, "\\\\").replace(/[;,]/g, "\\$&").replace(/\r?\n|\r/g, "\\n");
    const oneLine = (v: unknown) => String(v ?? "").replace(/[\r\n]/g, "");

    let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
    vcard += `FN:${esc(displayName)}\n`;
    vcard += `N:${esc(qr.surname)};${esc(qr.name)};;;\n`;

    if (qr.title) {
        vcard += `TITLE:${esc(qr.title)}\n`;
    }

    phones.forEach((p: any) => {
        if (p.value) {
            vcard += `TEL;TYPE=CELL:${esc(p.value)}\n`;
        }
    });

    if (qr.email) {
        vcard += `EMAIL;TYPE=INTERNET:${esc(qr.email)}\n`;
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
                    vcard += `URL;TYPE=${key.replace(/[^A-Za-z0-9-]/g, "")}:${oneLine(url)}\n`;
                }
            });
        } catch (e) {
            const url = String(qr.social_network).startsWith('http') ? qr.social_network : `https://${qr.social_network}`;
            vcard += `URL:${oneLine(url)}\n`;
        }
    }

    if (qr.profile_image && qr.profile_image.startsWith('data:')) {
        const parts = qr.profile_image.split(',');
        const mimeType = parts[0].split(':')[1].split(';')[0];
        const base64Data = parts[1];
        if (base64Data) {
            const type = mimeType.split('/')[1].toUpperCase().replace(/[^A-Z0-9]/g, "");
            vcard += `PHOTO;TYPE=${type};ENCODING=b:${oneLine(base64Data)}\n`;
        }
    }

    vcard += `REV:${new Date().toISOString()}\n`;
    vcard += `END:VCARD`;

    return new Response(vcard, {
        headers: {
            "Content-Type": "text/vcard",
            "Content-Disposition": `attachment; filename="${displayName.replace(/[^A-Za-z0-9._-]+/g, '_') || "contact"}.vcf"`,
        },
    });
}
