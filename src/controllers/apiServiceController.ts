import { Request, Response } from "express";
import { fetchSpec } from "../services/dbService";

export const getSupportedActions = async (req: Request, res: Response) => {
    try {
        const { domain, version } = req.query as {
            domain: string;
            version: string;
        };
        const data = await fetchSpec(domain, version, { include: "meta" });
        res.send({
            data: {
                supportedActions: data?.meta?.supportedActions || [],
                apiProperties: data?.meta?.apiProperties || [],
            },
        });
    } catch (e: any) {
        if (e.response?.status === 404) {
            return res
                .status(404)
                .send({ error: true, message: "Spec not found" });
        }
        if (e.message === "AUTOMATION_DB_BASE_URL is not configured") {
            return res.status(500).send({ error: true, message: e.message });
        }
        console.error("Error while fetching supported actions", e);
        res.status(500).send({
            error: true,
            message: "Error while fetching supported actions",
        });
    }
};

// FD (ONDC:FIS14:FD) builds carry a route table (FD-ROUTE-TABLE.md): each operation's method,
// path template, action, mode and parties. The mock playground and the UI read it here; a
// Beckn domain has none.
export const getFdRoutes = async (req: Request, res: Response) => {
    try {
        const { domain, version } = req.query as {
            domain: string;
            version: string;
        };
        const data = await fetchSpec(domain, version, { include: "meta" });
        const fdRoutes = data?.meta?.fdRoutes;
        if (!fdRoutes) {
            return res.status(404).send({
                error: true,
                message: `No FD route table for ${domain} ${version}`,
            });
        }
        res.send({ data: fdRoutes });
    } catch (e: any) {
        if (e.response?.status === 404) {
            return res
                .status(404)
                .send({ error: true, message: "Spec not found" });
        }
        if (e.message === "AUTOMATION_DB_BASE_URL is not configured") {
            return res.status(500).send({ error: true, message: e.message });
        }
        console.error("Error while fetching the FD route table", e);
        res.status(500).send({
            error: true,
            message: "Error while fetching the FD route table",
        });
    }
};
