
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { Document, Page, View, Text, Image, StyleSheet, PDFViewer, pdf, } from "@react-pdf/renderer";
import type { TextProps } from "@react-pdf/renderer";

type Props = {
    documentId: string;
    onClose: () => void;
};

type Data = Record<string, unknown>;

type SavedDocument = {
    id: string;
    documentType: string;
    clientName: string;
    eventName: string | null;
    eventDate: string | null;
    documentData: Data;
    studioSnapshot: Data;
    sectionsSnapshot: Data;
    createdAt: string;
};

const GOLD = "#a9824c";
const DARK = "#29251f";
const MUTED = "#77736d";
const LIGHT_GOLD = "#f7f3ec";
const BORDER = "#e8e0d4";

const styles = StyleSheet.create({
    page: {
        position: "relative",
        paddingTop: 122,
        paddingBottom: 65,
        paddingHorizontal: 43,
        fontFamily: "Helvetica",
        fontSize: 9,
        color: DARK,
        backgroundColor: "#ffffff",
    },

    // Decorative background
    backgroundShape: {
        position: "absolute",
        top: 115,
        right: -75,
        width: 190,
        height: 190,
        borderRadius: 95,
        borderWidth: 1,
        borderColor: "#f2eee7",
        opacity: 0.8,
    },

    backgroundShapeTwo: {
        position: "absolute",
        bottom: 100,
        left: -95,
        width: 210,
        height: 210,
        borderRadius: 105,
        borderWidth: 1,
        borderColor: "#f2eee7",
        opacity: 0.8,
    },

    watermark: {
        position: "absolute",
        top: "43%",
        left: 65,
        fontSize: 46,
        fontWeight: "bold",
        color: "#f7f5f1",
        opacity: 0.65,
        letterSpacing: 5,
        transform: "rotate(-35deg)",
    },

    // Header - repeated on every page
    header: {
        position: "absolute",
        top: 25,
        left: 43,
        right: 43,
        height: 79,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1.5,
        borderBottomColor: GOLD,
        paddingBottom: 12,
    },

    logoArea: {
        width: 125,
        height: 65,
        justifyContent: "center",
        alignItems: "flex-start",
    },

    logo: {
        maxWidth: 118,
        maxHeight: 62,
        objectFit: "contain",
    },

    logoFallback: {
        fontSize: 15,
        fontWeight: "bold",
        color: GOLD,
        letterSpacing: 1,
    },

    studioInfo: {
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center",
    },

    studioName: {
        fontSize: 12,
        fontWeight: "bold",
        color: DARK,
        marginBottom: 5,
        letterSpacing: 0.4,
    },

    studioDetail: {
        fontSize: 7.5,
        color: MUTED,
        marginBottom: 2,
        textAlign: "right",
        lineHeight: 1.35,
    },

    // Footer
    footer: {
        position: "absolute",
        bottom: 24,
        left: 43,
        right: 43,
        paddingTop: 9,
        borderTopWidth: 0.8,
        borderTopColor: BORDER,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    footerText: {
        fontSize: 7,
        color: "#99938a",
    },

    footerAccent: {
        fontSize: 7,
        color: GOLD,
        fontWeight: "bold",
    },

    // Document title
    titleArea: {
        alignItems: "center",
        marginBottom: 25,
        paddingTop: 9,
        paddingBottom: 19,
    },

    titleOverline: {
        fontSize: 7,
        color: GOLD,
        letterSpacing: 2.5,
        marginBottom: 9,
        fontWeight: "bold",
    },

    documentTitle: {
        fontSize: 21,
        fontWeight: "bold",
        color: DARK,
        letterSpacing: 1,
        textAlign: "center",
    },

    titleUnderline: {
        width: 48,
        height: 2,
        backgroundColor: GOLD,
        marginTop: 11,
        marginBottom: 9,
    },

    documentDate: {
        fontSize: 8,
        color: MUTED,
    },

    // Intro paragraph
    introduction: {
        fontSize: 9,
        lineHeight: 1.8,
        color: "#55504a",
        marginBottom: 22,
        textAlign: "justify",
    },

    // Sections
    section: {
        marginBottom: 21,
    },

    sectionHeadingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    sectionNumber: {
        width: 23,
        height: 23,
        backgroundColor: LIGHT_GOLD,
        borderRadius: 3,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 9,
    },

    sectionNumberText: {
        fontSize: 8,
        fontWeight: "bold",
        color: GOLD,
    },

    sectionHeading: {
        flex: 1,
        fontSize: 10,
        fontWeight: "bold",
        color: DARK,
        letterSpacing: 0.6,
    },

    sectionLine: {
        height: 1,
        backgroundColor: BORDER,
        marginBottom: 12,
    },

    // Details
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    detail: {
        width: "47%",
        marginBottom: 14,
    },

    detailLabel: {
        fontSize: 7,
        color: MUTED,
        marginBottom: 5,
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },

    detailValue: {
        fontSize: 9,
        color: DARK,
        fontWeight: "bold",
        lineHeight: 1.5,
    },

    // Amount summary
    amountBox: {
        marginTop: 7,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: LIGHT_GOLD,
        borderLeftWidth: 3,
        borderLeftColor: GOLD,
        borderRadius: 3,
    },

    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
    },

    amountLabel: {
        fontSize: 8,
        color: MUTED,
    },

    amountValue: {
        fontSize: 9,
        color: DARK,
        fontWeight: "bold",
    },

    balanceRow: {
        borderTopWidth: 1,
        borderTopColor: "#ded2c0",
        marginTop: 5,
        paddingTop: 10,
    },

    balanceLabel: {
        fontSize: 9,
        color: DARK,
        fontWeight: "bold",
    },

    balanceValue: {
        fontSize: 12,
        color: GOLD,
        fontWeight: "bold",
    },

    // Sessions
    session: {
        marginBottom: 11,
        borderWidth: 0.8,
        borderColor: BORDER,
        borderRadius: 4,
        overflow: "hidden",
    },

    sessionHeading: {
        backgroundColor: LIGHT_GOLD,
        paddingHorizontal: 11,
        paddingVertical: 9,
        borderBottomWidth: 0.8,
        borderBottomColor: BORDER,
    },

    sessionTitle: {
        fontSize: 9,
        fontWeight: "bold",
        color: DARK,
    },

    sessionBody: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    sessionTeam: {
        fontSize: 8,
        lineHeight: 1.7,
        color: "#55504a",
    },

    // Rich text sections
    extraSection: {
        marginBottom: 19,
    },

    extraHeading: {
        fontSize: 10,
        fontWeight: "bold",
        color: DARK,
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },

    extraContent: {
        fontSize: 8,
        lineHeight: 1.8,
        color: "#55504a",
    },

    richParagraph: {
        fontSize: 8,
        lineHeight: 1.8,
        color: "#55504a",
        marginBottom: 5,
    },

    richHeading: {
        fontSize: 10,
        lineHeight: 1.5,
        fontWeight: "bold",
        color: DARK,
        marginTop: 7,
        marginBottom: 5,
    },

    richList: {
        marginBottom: 5,
        paddingLeft: 8,
    },

    richListItem: {
        flexDirection: "row",
        marginBottom: 4,
    },

    richListMarker: {
        width: 15,
        fontSize: 8,
        color: GOLD,
    },

    richListText: {
        flex: 1,
        fontSize: 8,
        lineHeight: 1.7,
        color: "#55504a",
    },

    // Signatures
    signatureArea: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 52,
        marginBottom: 15,
    },

    signature: {
        width: "40%",
        borderTopWidth: 1,
        borderTopColor: "#a9a198",
        paddingTop: 9,
        alignItems: "center",
    },

    signatureText: {
        fontSize: 8,
        color: DARK,
        fontWeight: "bold",
        textAlign: "center",
    },

    signatureCaption: {
        fontSize: 7,
        color: MUTED,
        marginTop: 4,
    },
});

function getText(value: unknown): string {
    if (value === null || value === undefined) return "";

    if (typeof value === "string") return value.trim();

    if (typeof value === "number") return String(value);

    return "";
}

function formatDate(value: unknown): string {
    if (!value) return "-";

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function getInlineStyle(element: HTMLElement): TextProps["style"] {
    const style: Record<string, string | number> = {};

    const tag = element.tagName.toLowerCase();
    const css = element.style;

    if (tag === "b" || tag === "strong") {
        style.fontWeight = "bold";
    }

    if (tag === "i" || tag === "em") {
        style.fontStyle = "italic";
    }

    if (tag === "u") {
        style.textDecoration = "underline";
    }

    if (tag === "s" || tag === "strike" || tag === "del") {
        style.textDecoration = "line-through";
    }

    if (css.fontWeight === "bold" || Number(css.fontWeight) >= 600) {
        style.fontWeight = "bold";
    }

    if (css.fontStyle === "italic") {
        style.fontStyle = "italic";
    }

    if (css.textDecoration.includes("underline")) {
        style.textDecoration = "underline";
    }

    if (css.textDecoration.includes("line-through")) {
        style.textDecoration = "line-through";
    }

    if (css.color) {
        style.color = css.color;
    }

    if (css.fontSize) {
        const size = parseFloat(css.fontSize);

        if (!Number.isNaN(size)) {
            style.fontSize = css.fontSize.includes("pt")
                ? size
                : size * 0.75;
        }
    }

    return style as TextProps["style"];
}

function renderInlineNodes(
    nodes: ChildNode[],
    keyPrefix: string
): ReactNode[] {
    return nodes.map((node, index) => {
        const key = `${keyPrefix}-${index}`;

        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent || "";
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const element = node as HTMLElement;
        const tag = element.tagName.toLowerCase();

        if (tag === "br") {
            return (
                <Text key={key}>
                    {"\n"}
                </Text>
            );
        }

        if (["img", "script", "style"].includes(tag)) {
            return null;
        }

        const children = renderInlineNodes(
            Array.from(element.childNodes),
            key
        );

        return (
            <Text
                key={key}
                style={getInlineStyle(element)}
            >
                {children}
            </Text>
        );
    });
}

function renderRichContent(
    html: string
): ReactNode[] {
    if (!html.trim()) return [];

    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");

    let listCounter = 0;

    function renderBlock(
        node: Node,
        key: string
    ): ReactNode {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || "";

            if (!text.trim()) return null;

            return (
                <Text key={key} style={styles.richParagraph}>
                    {text}
                </Text>
            );
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const element = node as HTMLElement;
        const tag = element.tagName.toLowerCase();

        if (["script", "style", "img"].includes(tag)) {
            return null;
        }

        if (tag === "br") {
            return null;
        }

        if (tag === "ul" || tag === "ol") {
            listCounter = 0;

            const ordered = tag === "ol";

            return (
                <View key={key} style={styles.richList}>
                    {Array.from(element.children).map(
                        (item, index) => {
                            const itemElement = item as HTMLElement;

                            if (
                                itemElement.tagName.toLowerCase() !== "li"
                            ) {
                                return null;
                            }

                            const marker = ordered
                                ? `${index + 1}.`
                                : "•";

                            return (
                                <View
                                    key={`${key}-item-${index}`}
                                    style={styles.richListItem}
                                >
                                    <Text style={styles.richListMarker}>
                                        {marker}
                                    </Text>

                                    <Text style={styles.richListText}>
                                        {renderInlineNodes(
                                            Array.from(itemElement.childNodes),
                                            `${key}-li-${index}`
                                        )}
                                    </Text>
                                </View>
                            );
                        }
                    )}
                </View>
            );
        }

        if (tag === "li") {
            return (
                <View key={key} style={styles.richListItem}>
                    <Text style={styles.richListMarker}>•</Text>

                    <Text style={styles.richListText}>
                        {renderInlineNodes(
                            Array.from(element.childNodes),
                            key
                        )}
                    </Text>
                </View>
            );
        }

        if (/^h[1-6]$/.test(tag)) {
            return (
                <Text
                    key={key}
                    style={[
                        styles.richHeading,
                        getInlineStyle(element),
                    ]}
                >
                    {renderInlineNodes(
                        Array.from(element.childNodes),
                        key
                    )}
                </Text>
            );
        }

        if (tag === "p") {
            return (
                <Text
                    key={key}
                    style={[
                        styles.richParagraph,
                        getInlineStyle(element),
                    ]}
                >
                    {renderInlineNodes(
                        Array.from(element.childNodes),
                        key
                    )}
                </Text>
            );
        }

        if (tag === "div" || tag === "blockquote") {
            return (
                <View key={key}>
                    {renderRichContentFromNodes(
                        Array.from(element.childNodes),
                        key
                    )}
                </View>
            );
        }

        return (
            <Text key={key} style={getInlineStyle(element)}>
                {renderInlineNodes(
                    Array.from(element.childNodes),
                    key
                )}
            </Text>
        );
    }

    function renderRichContentFromNodes(
        nodes: ChildNode[],
        prefix: string
    ): ReactNode[] {
        return nodes.map((node, index) =>
            renderBlock(node, `${prefix}-${index}`)
        );
    }

    return renderRichContentFromNodes(
        Array.from(parsed.body.childNodes),
        "rich"
    );
}

function currency(amount: number): string {
    return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function SectionHeading({
    number,
    title,
}: {
    number: string;
    title: string;
}) {
    return (
        <View style={styles.sectionHeadingRow}>
            <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>
                    {number}
                </Text>
            </View>

            <Text style={styles.sectionHeading}>
                {title}
            </Text>
        </View>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: unknown;
}) {
    const text = getText(value);

    if (!text || text === "-") return null;

    return (
        <View style={styles.detail}>
            <Text style={styles.detailLabel}>
                {label}
            </Text>

            <Text style={styles.detailValue}>
                {text}
            </Text>
        </View>
    );
}

function ExtraSection({
    title,
    content,
}: {
    title: string;
    content: unknown;
}) {
    if (typeof content !== "string" || !content.trim()) {
        return null;
    }

    const renderedContent = renderRichContent(content);

    if (!renderedContent.length) {
        return null;
    }

    return (
        <View style={styles.extraSection}>
            <Text style={styles.extraHeading}>
                {title}
            </Text>

            <View>
                {renderedContent}
            </View>
        </View>
    );
}

function StudioPDF({
    savedDocument,
}: {
    savedDocument: SavedDocument;
}) {
    const data = savedDocument.documentData || {};
    const studio = savedDocument.studioSnapshot || {};
    const sections = savedDocument.sectionsSnapshot || {};

    const isContract = savedDocument.documentType === "contract";

    const documentTitle = isContract
        ? "LETTER OF CONTRACT"
        : "QUOTATION";

    const studioName = getText(studio.name) || "Studio";

    const studioAddress = [
        studio.address,
        studio.city,
        studio.state,
        studio.country,
    ]
        .map(getText)
        .filter(Boolean)
        .join(", ");

    const logoUrl = getText(studio.logoUrl);

    const phone = getText(studio.phone);
    const email = getText(studio.email);
    const website = getText(studio.website);

    const sessions = Array.isArray(data.sessions)
        ? data.sessions as Data[]
        : [];

    const totalAmount = Number(data.totalAmount || 0);
    const advanceAmount = Number(data.advanceAmount || 0);
    const balanceAmount = totalAmount - advanceAmount;

    const eventDate = formatDate(data.eventDate);

    const introduction = isContract
        ? `This contract is entered into on ${formatDate(savedDocument.createdAt)} by and between ${studioName}${studioAddress ? `, ${studioAddress}` : ""}, and the client named below. Both parties agree to the following event and package details.`
        : `This quotation is prepared by ${studioName} for the client named below, covering the event and package details described in this document.`;

    return (
        <Document
            title={`${isContract ? "Letter of Contract" : "Quotation"} - ${savedDocument.clientName}`}
            author={studioName}
            subject="Studio Document"
        >
            <Page size="A4" style={styles.page} wrap>

                {/* Background decoration */}
                <View style={styles.backgroundShape} fixed />
                <View style={styles.backgroundShapeTwo} fixed />

                <Text style={styles.watermark} fixed>
                    {studioName.toUpperCase()}
                </Text>

                {/* Repeated studio header */}
                <View style={styles.header} fixed>
                    <View style={styles.logoArea}>
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                style={styles.logo}
                            />
                        ) : (
                            <Text style={styles.logoFallback}>
                                {studioName}
                            </Text>
                        )}
                    </View>

                    <View style={styles.studioInfo}>
                        <Text style={styles.studioName}>
                            {studioName}
                        </Text>

                        {studioAddress ? (
                            <Text style={styles.studioDetail}>
                                {studioAddress}
                            </Text>
                        ) : null}

                        {phone ? (
                            <Text style={styles.studioDetail}>
                                {phone}
                            </Text>
                        ) : null}

                        {email ? (
                            <Text style={styles.studioDetail}>
                                {email}
                            </Text>
                        ) : null}

                        {website ? (
                            <Text style={styles.studioDetail}>
                                {website}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {/* Repeated page footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        {studioName}
                    </Text>

                    <Text
                        style={styles.footerAccent}
                        render={({ pageNumber, totalPages }) =>
                            `PAGE ${pageNumber} OF ${totalPages}`
                        }
                    />
                </View>

                {/* Document title */}
                <View style={styles.titleArea}>
                    <Text style={styles.titleOverline}>
                        {isContract
                            ? "OFFICIAL AGREEMENT"
                            : "EVENT PROPOSAL"}
                    </Text>

                    <Text style={styles.documentTitle}>
                        {documentTitle}
                    </Text>

                    <View style={styles.titleUnderline} />

                    <Text style={styles.documentDate}>
                        Document Date: {formatDate(savedDocument.createdAt)}
                    </Text>
                </View>

                <Text style={styles.introduction}>
                    {introduction}
                </Text>

                {/* Client details */}
                <View style={styles.section}>
                    <SectionHeading
                        number="01"
                        title="CLIENT DETAILS"
                    />

                    <View style={styles.sectionLine} />

                    <View style={styles.detailsGrid}>
                        <Detail
                            label="Client Name"
                            value={data.clientName || savedDocument.clientName}
                        />

                        <Detail
                            label="Mobile Number"
                            value={data.clientMobile}
                        />

                        <Detail
                            label="Email Address"
                            value={data.clientEmail}
                        />

                        <Detail
                            label="Address"
                            value={data.clientAddress}
                        />
                    </View>
                </View>

                {/* Event details */}
                <View style={styles.section}>
                    <SectionHeading
                        number="02"
                        title="EVENT DETAILS"
                    />

                    <View style={styles.sectionLine} />

                    <View style={styles.detailsGrid}>
                        <Detail
                            label="Bride Name"
                            value={data.brideName}
                        />

                        <Detail
                            label="Groom Name"
                            value={data.groomName}
                        />

                        <Detail
                            label="Event Name"
                            value={data.eventName || savedDocument.eventName}
                        />

                        <Detail
                            label="Event Date"
                            value={eventDate}
                        />

                        <Detail
                            label="Venue"
                            value={data.venue}
                        />

                        <Detail
                            label="Event Time"
                            value={data.eventTime}
                        />
                    </View>
                </View>

                {/* Package details */}
                <View style={styles.section}>
                    <SectionHeading
                        number="03"
                        title="PACKAGE DETAILS"
                    />

                    <View style={styles.sectionLine} />

                    <View style={styles.detailsGrid}>
                        <Detail
                            label="Package Name"
                            value={data.packageName}
                        />
                    </View>

                    <View style={styles.amountBox}>
                        <View style={styles.amountRow}>
                            <Text style={styles.amountLabel}>
                                Total Amount
                            </Text>

                            <Text style={styles.amountValue}>
                                {currency(totalAmount)}
                            </Text>
                        </View>

                        <View style={styles.amountRow}>
                            <Text style={styles.amountLabel}>
                                Advance Amount
                            </Text>

                            <Text style={styles.amountValue}>
                                {currency(advanceAmount)}
                            </Text>
                        </View>

                        <View style={[styles.amountRow, styles.balanceRow]}>
                            <Text style={styles.balanceLabel}>
                                Balance Amount
                            </Text>

                            <Text style={styles.balanceValue}>
                                {currency(balanceAmount)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Sessions */}
                {sessions.some(
                    (session) =>
                        getText(session.title) ||
                        getText(session.team)
                ) ? (
                    <View style={styles.section}>
                        <SectionHeading
                            number="04"
                            title="EVENT SESSIONS & TEAM"
                        />

                        <View style={styles.sectionLine} />

                        {sessions.map((session, index) => {
                            if (
                                !getText(session.title) &&
                                !getText(session.team)
                            ) {
                                return null;
                            }

                            return (
                                <View
                                    key={index}
                                    style={styles.session}
                                    wrap={false}
                                >
                                    <View style={styles.sessionHeading}>
                                        <Text style={styles.sessionTitle}>
                                            SESSION {index + 1} :{" "}
                                            {getText(session.title)}
                                        </Text>
                                    </View>

                                    {getText(session.team) ? (
                                        <View style={styles.sessionBody}>
                                            <Text style={styles.sessionTeam}>
                                                {getText(session.team)}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            );
                        })}
                    </View>
                ) : null}

                {/* Optional sections */}
                <ExtraSection
                    title="FREQUENTLY ASKED QUESTIONS"
                    content={sections.faq}
                />

                <ExtraSection
                    title="TERMS & CONDITIONS"
                    content={sections.terms}
                />

                <ExtraSection
                    title="POLICIES"
                    content={sections.policies}
                />

                {/* Signatures */}
                <View style={styles.signatureArea} wrap={false}>
                    <View style={styles.signature}>
                        <Text style={styles.signatureText}>
                            Client Signature
                        </Text>

                        <Text style={styles.signatureCaption}>
                            Name & Date
                        </Text>
                    </View>

                    <View style={styles.signature}>
                        <Text style={styles.signatureText}>
                            {studioName}
                        </Text>

                        <Text style={styles.signatureCaption}>
                            Authorized Signature
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export default function DocumentPreview({
    documentId,
    onClose,
}: Props) {
    const [savedDocument, setSavedDocument] =
        useState<SavedDocument | null>(null);

    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadDocument() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/admin/documents/${encodeURIComponent(documentId)}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to load document."
                    );
                }

                if (!cancelled) {
                    setSavedDocument(result.document);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load document."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDocument();

        return () => {
            cancelled = true;
        };
    }, [documentId]);

    const pdfDocument = useMemo(() => {
        if (!savedDocument) return null;

        return (
            <StudioPDF savedDocument={savedDocument} />
        );
    }, [savedDocument]);

    const handleDownload = async () => {
        if (!savedDocument || !pdfDocument || downloading) {
            return;
        }

        try {
            setDownloading(true);
            setError("");

            const blob = await pdf(pdfDocument).toBlob();

            const url = URL.createObjectURL(blob);

            const link = window.document.createElement("a");

            const safeName = savedDocument.clientName
                .replace(/[^a-z0-9-_ ]/gi, "")
                .trim()
                .replace(/\s+/g, "-");

            const documentName =
                savedDocument.documentType === "contract"
                    ? "Letter-of-Contract"
                    : "Quotation";

            link.href = url;
            link.download = `${documentName}-${safeName || "Client"}.pdf`;

            window.document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
        } catch (err) {
            console.error("PDF generation error:", err);

            setError(
                "PDF generate panna mudiyala. Please try again."
            );
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#181715]">

            {/* Toolbar */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#211f1c] px-4 py-3 sm:px-6">

                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Back to History
                </button>

                <div className="flex items-center gap-3">
                    {savedDocument && (
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-white">
                                {savedDocument.clientName}
                            </p>

                            <p className="text-xs text-zinc-500">
                                {savedDocument.documentType === "contract"
                                    ? "Letter of Contract"
                                    : "Quotation"}
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={!savedDocument || loading || downloading}
                        className="flex items-center gap-2 rounded-lg bg-[#a9824c] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#bd9864] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {downloading ? (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <Download size={16} />
                        )}

                        {downloading
                            ? "Generating PDF..."
                            : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Preview */}
            {loading ? (
                <div className="flex flex-1 items-center justify-center gap-3 text-sm text-zinc-400">
                    <Loader2
                        className="animate-spin"
                        size={22}
                    />
                    Loading document...
                </div>
            ) : error && !savedDocument ? (
                <div className="flex flex-1 items-center justify-center p-6 text-sm text-red-400">
                    {error}
                </div>
            ) : pdfDocument ? (
                <div className="flex min-h-0 flex-1 flex-col bg-[#292723] p-2 sm:p-5">

                    {error && (
                        <p className="mb-2 text-center text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
                        <PDFViewer
                            width="100%"
                            height="100%"
                            showToolbar={false}
                            style={{
                                border: "none",
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            {pdfDocument}
                        </PDFViewer>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center gap-2 text-zinc-400">
                    <FileText size={20} />
                    <span className="text-sm">
                        Document unavailable.
                    </span>
                </div>
            )}
        </div>
    );
}
