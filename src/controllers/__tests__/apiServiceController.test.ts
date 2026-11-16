import { Request, Response } from "express";
import { getFdRoutes } from "../apiServiceController";
import { fetchSpec } from "../../services/dbService";

jest.mock("../../services/dbService", () => ({
	fetchSpec: jest.fn(),
}));

const mockFetchSpec = fetchSpec as jest.MockedFunction<typeof fetchSpec>;

function call(query: Record<string, string>) {
	const res = {
		statusCode: 200,
		body: undefined as unknown,
		status(code: number) {
			this.statusCode = code;
			return this;
		},
		send(body: unknown) {
			this.body = body;
			return this;
		},
	};
	return getFdRoutes({ query } as unknown as Request, res as unknown as Response).then(
		() => res,
	);
}

describe("getFdRoutes", () => {
	afterEach(() => jest.resetAllMocks());

	it("returns the FD route table from the build's meta", async () => {
		const fdRoutes = { formatVersion: 1, domain: "ONDC:FIS14:FD", version: "0.1.4", routes: [] };
		mockFetchSpec.mockResolvedValue({ meta: { fdRoutes } });
		const res = await call({ domain: "ONDC:FIS14:FD", version: "0.1.4" });
		expect(mockFetchSpec).toHaveBeenCalledWith("ONDC:FIS14:FD", "0.1.4", { include: "meta" });
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ data: fdRoutes });
	});

	it("answers 404 for a domain without a route table", async () => {
		mockFetchSpec.mockResolvedValue({ meta: { supportedActions: {} } });
		const res = await call({ domain: "ONDC:FIS12", version: "2.3.0" });
		expect(res.statusCode).toBe(404);
	});

	it("answers 404 when the spec is not found", async () => {
		mockFetchSpec.mockRejectedValue({ response: { status: 404 } });
		const res = await call({ domain: "X", version: "1" });
		expect(res.statusCode).toBe(404);
	});
});
