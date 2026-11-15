import { useEffect, useState } from "react";
import StudentLayout, { StudentPageHeader } from "./StudentLayout";
import { api, imageUrl } from "../teacher/api";
import useAsync from "../lib/useAsync";
import { Badge, Button, Card, EmptyState, ErrorState, Segmented, Skeleton } from "../teacher/components/ui";
import Icon from "../teacher/components/Icon";
import { fmtWhen, relative } from "./examFormat";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function StudentNotices() {
  const { status, data, error, reload, setData } = useAsync((signal) => api.notices({ signal }), []);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(() => window.location.hash.slice(1) || null);

  const markRead = async (n) => {
    if (n.readAt) return;
    try {
      await api.markNoticeRead(n._id);
      setData({ ...data, unread: Math.max(0, data.unread - 1), notices: data.notices.map((x) => (x._id === n._id ? { ...x, readAt: new Date().toISOString() } : x)) });
      window.dispatchEvent(new Event("examino:notices-changed"));
    } catch {
      /* will retry next time it is opened */
    }
  };

  useEffect(() => {
    if (open && data) {
      const n = data.notices.find((x) => x._id === open);
      if (n) markRead(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data?.notices?.length]);

  const list = (data?.notices || []).filter((n) => filter === "all" || !n.readAt);

  return (
    <StudentLayout maxWidth="max-w-3xl">
      <StudentPageHeader
        title="Notices"
        subtitle="Announcements from your teachers for you and your batches."
        actions={<Segmented label="Filter notices" size="sm" value={filter} onChange={setFilter} options={[{ value: "all", label: "All" }, { value: "unread", label: `Unread${data?.unread ? ` (${data.unread})` : ""}` }]} />}
      />
      {status === "loading" ? (
        <Skeleton className="h-64" />
      ) : status === "error" ? (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      ) : !list.length ? (
        <Card>
          <EmptyState icon="megaphone" title={filter === "unread" ? "You're all caught up." : "No notices yet."} description="Notices your teachers send to you or your batches appear here." />
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((n) => {
            const expanded = open === n._id;
            return (
              <Card key={n._id} id={n._id} className={cx("transition-shadow", !n.readAt && "border-l-4 border-l-examino-blue")}>
                <button type="button" className="flex w-full items-start gap-3 p-5 text-left" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : n._id)}>
                  <span className={cx("mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", n.priority === "urgent" ? "bg-examino-rose-light text-examino-rose-dark" : n.priority === "important" ? "bg-examino-amber-soft text-amber-600" : "bg-examino-blue-light text-examino-blue")}>
                    <Icon name="megaphone" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={cx("text-sm text-examino-text font-bengali", !n.readAt && "font-semibold")}>{n.title}</span>
                      {n.priority !== "normal" ? <Badge tone={n.priority === "urgent" ? "red" : "amber"}>{n.priority === "urgent" ? "Urgent" : "Important"}</Badge> : null}
                      {!n.readAt ? <Badge tone="blue">New</Badge> : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-examino-muted">
                      {n.authorName ? `${n.authorName} · ` : ""}
                      {fmtWhen(n.publishAt)} ({relative(n.publishAt)})
                    </span>
                    {!expanded && n.body ? <span className="mt-1 line-clamp-1 block text-sm text-examino-muted font-bengali">{n.body}</span> : null}
                  </span>
                  <Icon name={expanded ? "chevronUp" : "chevronDown"} size={16} className="mt-1 text-examino-muted" />
                </button>
                {expanded ? (
                  <div className="border-t border-examino-border px-5 py-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 font-bengali">{n.body || "No details."}</p>
                    {n.attachmentUrl ? (
                      <a href={imageUrl(n.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-examino-border px-3 py-2 text-sm font-semibold text-examino-blue hover:bg-slate-50">
                        <Icon name="download" size={15} />
                        {n.attachmentName || "Attachment"}
                      </a>
                    ) : null}
                    {n.expiresAt ? <p className="mt-3 text-xs text-examino-muted">Visible until {fmtWhen(n.expiresAt)}</p> : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
      {status === "ready" && data.unread ? (
        <div className="mt-4 text-right">
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await Promise.all(data.notices.filter((n) => !n.readAt).map((n) => api.markNoticeRead(n._id).catch(() => null)));
              reload();
              window.dispatchEvent(new Event("examino:notices-changed"));
            }}
          >
            Mark all as read
          </Button>
        </div>
      ) : null}
    </StudentLayout>
  );
}
