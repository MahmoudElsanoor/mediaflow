import type { MockVideo } from "@/types/video";

export const initialVideos: MockVideo[] = [
  {
    id: 1,
    title: "Sample Video Review",
    videoUrl: "/videos/sample-1.mp4",
    status: "Pending",
    savedNote: "",
    commentText: "",
    isCommentOpen: false,
  },
  {
    id: 2,
    title: "Launch Reel Draft",
    videoUrl: "/videos/sample-2.mp4",
    status: "Pending",
    savedNote: "",
    commentText: "",
    isCommentOpen: false,
  },
  {
    id: 3,
    title: "Social Cutdown Preview",
    videoUrl: "/videos/sample-3.mp4",
    status: "Pending",
    savedNote: "",
    commentText: "",
    isCommentOpen: false,
  },
];
