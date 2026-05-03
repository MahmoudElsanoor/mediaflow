export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export type MockVideo = {
  id: string;
  title: string;
  videoUrl: string;
  status: ReviewStatus;
  savedNote: string;
  commentText: string;
  isCommentOpen: boolean;
};
