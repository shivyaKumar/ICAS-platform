"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: number;
  text: string;
  user: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentDrawerProps {
  findingId: number;
  onRefresh?: () => void;
}

export default function CommentDrawer({ findingId, onRefresh }: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  /* ---------- Fetch existing comments ---------- */
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments/finding/${findingId}`);
      if (res.ok) {
        const data: Comment[] = await res.json();
        setComments(data);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [findingId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /* ---------- Add new comment ---------- */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/comments/finding/${findingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        await fetchComments();
        onRefresh?.();
      } else {
        console.error("Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  /* ---------- Edit comment ---------- */
  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleUpdate = async (id: number) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditText("");
        await fetchComments();
        onRefresh?.();
      } else {
        console.error("Failed to update comment");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  /* ---------- Delete comment ---------- */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchComments();
        onRefresh?.();
      } else {
        console.error("Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  /* ---------- Render ---------- */
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-3 py-1.5 rounded-none border border-gray-300 transition-all"
        >
          Add Comment
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className="sm:w-[500px] right-0 ml-auto h-screen flex flex-col 
                   bg-white border-l border-gray-200 shadow-xl"
      >
        {/* Header */}
        <DrawerHeader className="border-b bg-gray-50 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
          <DrawerTitle className="text-base font-semibold text-gray-900">
            Comments
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-scroll px-6 py-6 space-y-6 text-sm text-gray-800">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">All Comments</h4>

            {loading ? (
              <p className="text-xs text-gray-500 italic">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 transition"
                  >
                    {editingId === c.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdate(c.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(null);
                              setEditText("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-900">{c.text}</p>
                          <p className="text-[11px] text-gray-500 mt-1">
                            {c.user} • {new Date(c.createdAt).toLocaleString()}{" "}
                            {c.updatedAt ? (
                              <span className="italic text-gray-400">(edited)</span>
                            ) : null}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleEdit(c)}
                          >
                            <Edit className="h-3.5 w-3.5 text-gray-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Add new comment */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Add a new comment
            </h4>
            <div className="flex flex-col gap-3">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-900 
                          focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                          resize-none min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button variant={"secondary"} size={"sm"} onClick={handleAddComment}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
