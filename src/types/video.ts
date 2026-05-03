export type ReviewStatus = "Pending" | "Approved" | "Rejected";

export type MockVideo = {
  id: number;
  title: string;
  status: ReviewStatus;
  savedNote: string;
  commentText: string;
  isCommentOpen: boolean;
};
