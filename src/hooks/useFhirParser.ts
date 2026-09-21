import { useState, useCallback } from "react";
import { toast } from "sonner";
import { notify } from "@/lib/notify";

export interface ParsedFhirData {
  rawJson: any;
  rawString: string;
  bundleId: string;
  bundleType: string;
  timestamp: string;
  patient: any | null;
  practitioner: any | null;
  organization: any | null;
  encounter: any | null;
  composition: any | null;
  diagnosticReports: any[];
  documentReferences: any[];
  observations: any[];
  conditions: any[];
  medications: any[];
  allergies: any[];
  procedures: any[];
  immunizations: any[];
  carePlans: any[];
  allResources: { type: string; fullUrl: string; resource: any }[];
  resourceCounts: Record<string, number>;
}

export function useFhirParser(initialJsonData?: any) {
  const [data, setData] = useState<ParsedFhirData | null>(() => {
    if (initialJsonData) {
      return parseFhirBundle(initialJsonData);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  function parseFhirBundle(jsonObj: any): ParsedFhirData | null {
    if (!jsonObj || typeof jsonObj !== "object") {
      throw new Error("Invalid JSON: Expected an object.");
    }
    if (jsonObj.resourceType !== "Bundle") {
      throw new Error(`Invalid FHIR Resource: Expected resourceType "Bundle", got "${jsonObj.resourceType || "undefined"}"`);
    }

    const entries: any[] = Array.isArray(jsonObj.entry) ? jsonObj.entry : [];

    const composition = entries.find((e) => e.resource?.resourceType === "Composition")?.resource || null;
    const patient = entries.find((e) => e.resource?.resourceType === "Patient")?.resource || null;
    const practitioner = entries.find((e) => e.resource?.resourceType === "Practitioner")?.resource || null;
    const organization = entries.find((e) => e.resource?.resourceType === "Organization")?.resource || null;
    const encounter = entries.find((e) => e.resource?.resourceType === "Encounter")?.resource || null;

    const diagnosticReports = entries
      .filter((e) => e.resource?.resourceType === "DiagnosticReport")
      .map((e) => e.resource);

    const documentReferences = entries
      .filter((e) => e.resource?.resourceType === "DocumentReference")
      .map((e) => e.resource);

    const observations = entries
      .filter((e) => e.resource?.resourceType === "Observation")
      .map((e) => e.resource);

    const conditions = entries
      .filter((e) => e.resource?.resourceType === "Condition")
      .map((e) => e.resource);

    const medications = entries
      .filter((e) => e.resource?.resourceType === "MedicationRequest" || e.resource?.resourceType === "MedicationStatement" || e.resource?.resourceType === "Medication")
      .map((e) => e.resource);

    const allergies = entries
      .filter((e) => e.resource?.resourceType === "AllergyIntolerance")
      .map((e) => e.resource);

    const procedures = entries
      .filter((e) => e.resource?.resourceType === "Procedure")
      .map((e) => e.resource);

    const immunizations = entries
      .filter((e) => e.resource?.resourceType === "Immunization")
      .map((e) => e.resource);

    const carePlans = entries
      .filter((e) => e.resource?.resourceType === "CarePlan")
      .map((e) => e.resource);

    const allResources = entries.map((e) => ({
      type: e.resource?.resourceType || "Unknown",
      fullUrl: e.fullUrl || "",
      resource: e.resource || {},
    }));

    const resourceCounts: Record<string, number> = {};
    allResources.forEach((item) => {
      resourceCounts[item.type] = (resourceCounts[item.type] || 0) + 1;
    });

    return {
      rawJson: jsonObj,
      rawString: JSON.stringify(jsonObj, null, 2),
      bundleId: jsonObj.id || "Bundle-ABDM-01",
      bundleType: jsonObj.type || "document",
      timestamp: jsonObj.timestamp || new Date().toISOString(),
      patient,
      practitioner,
      organization,
      encounter,
      composition,
      diagnosticReports,
      documentReferences,
      observations,
      conditions,
      medications,
      allergies,
      procedures,
      immunizations,
      carePlans,
      allResources,
      resourceCounts,
    };
  }

  const parseJson = useCallback((jsonInput: string | object) => {
    setIsLoading(true);
    try {
      let parsedObj: any;
      if (typeof jsonInput === "string") {
        if (!jsonInput.trim()) {
          throw new Error("JSON text is empty.");
        }
        parsedObj = JSON.parse(jsonInput);
      } else {
        parsedObj = jsonInput;
      }

      const result = parseFhirBundle(parsedObj);
      setData(result);
      toast.success("FHIR Bundle parsed successfully!");
      return true;
    } catch (err: any) {
      console.error("FHIR Parsing error:", err);
      const msg = err.message || "Failed to parse FHIR Bundle";
      toast.error(msg);
      notify.apiError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    toast.info("FHIR Viewer cleared.");
  }, []);

  const exportJson = useCallback(() => {
    if (!data) return;
    const blob = new Blob([data.rawString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.bundleId || "fhir-bundle"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("FHIR Bundle JSON downloaded.");
  }, [data]);

  const copyJson = useCallback(() => {
    if (!data) return;
    navigator.clipboard.writeText(data.rawString);
    toast.success("FHIR Bundle JSON copied to clipboard!");
  }, [data]);

  return {
    data,
    isLoading,
    parseJson,
    clear,
    exportJson,
    copyJson,
  };
}
