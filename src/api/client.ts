import { z } from "zod";

import { config } from "../config";

export const reportSchema = z
  .object({
    timestamp: z.string().transform((value) => new Date(value)),
    station: z.object({
      id: z.string(),
    }),
  })
  .transform(({ timestamp, station }) => ({
    timestamp,
    stationId: station.id,
  }));

export type Report = z.infer<typeof reportSchema>;

const getReports = async (): Promise<Report[]> => {
  const response = await fetch(`${config.FF_API_BASE_URL}/recent`);
  const data = await response.json();

  return reportSchema.array().parse(data);
};

const stationSchema = z.object({
  name: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  lines: z.array(z.string()),
});

export type Station = z.infer<typeof stationSchema>;

const getStations = async (): Promise<Record<string, Station>> => {
  const response = await fetch(`${config.FF_API_BASE_URL}/list?stations=true`);
  const data = await response.json();

  return z.record(z.string(), stationSchema).parse(data);
};

const linesSchema = z.record(z.string(), z.string().array());

const getLines = async (): Promise<Record<string, string[]>> => {
  const response = await fetch(`${config.FF_API_BASE_URL}/list?lines=true`);
  const data = await response.json();

  return linesSchema.parse(data);
};

type PostReport = {
  line: string;
  station: string;
  direction: string;
};

const postReport = async (report: PostReport) => {
  const response = await fetch(`${config.FF_API_BASE_URL}/newInspector`, {
    method: "POST",
    body: JSON.stringify(report),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const api = {
  getReports,
  getStations,
  getLines,
  postReport,
};
