
/**
 * This service provides mock evidence data for demonstration purposes
 * It will be used when no real evidence is available to show the UI functionality
 */

import { v4 as uuidv4 } from 'uuid';

// Generate mock evidence for a report
export const generateMockEvidence = (reportId: string, userId: string) => {
  return [
    {
      id: uuidv4(),
      report_id: reportId,
      user_id: userId,
      title: "Video Evidence",
      description: "Camera footage from the incident scene",
      type: "video",
      storage_path: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      uploaded_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      report_id: reportId,
      user_id: userId,
      title: "Photo Evidence",
      description: "Photo from the scene",
      type: "image",
      storage_path: "https://picsum.photos/id/237/800/600",
      uploaded_at: new Date().toISOString()
    },
    {
      id: uuidv4(),
      report_id: reportId,
      user_id: userId,
      title: "Additional Photo",
      description: "Secondary image from different angle",
      type: "image",
      storage_path: "https://picsum.photos/id/1/800/600",
      uploaded_at: new Date().toISOString()
    }
  ];
};

// Generate mock evidence for all reports that don't have evidence
export const addMockEvidenceToReports = (reports: any[]) => {
  if (!reports || !Array.isArray(reports)) return reports;
  
  return reports.map(report => {
    if (!report.evidence || report.evidence.length === 0) {
      return {
        ...report,
        evidence: generateMockEvidence(report.id, report.user_id)
      };
    }
    return report;
  });
};

export default {
  generateMockEvidence,
  addMockEvidenceToReports
};
