import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  createTicket,
  deleteAddress,
  getMe,
  listAddresses,
  listNotifications,
  listOrders,
  listTickets,
  markNotificationsRead,
  updateProfile,
} from "@/lib/mehrait/account.functions";
import { useCatalog } from "@/lib/mehrait/use-catalog";
import { inr } from "@/lib/mehrait/pricing";
import { STATUS_LABEL } from "@/lib/mehrait/types";
import { isStaff } from "@/lib/mehrait/permissions";
import { Shell } from "@/components/mehrait/shell";

export const Route = createFileRoute("/account")({ component: AccountPage });

const TABS = ["Profile", "Addresses", "Orders", "Alerts", "Support"] as const;

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const { catalog } = useCatalog();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  const [me, setMe] = useState<Awaited<ReturnType<typeof getMe>> | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState<Awaited<ReturnType<typeof listAddresses>>>([]);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof listOrders>>>([]);
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listNotifications>>>([]);
  const [tickets, setTickets] = useState<Awaited<ReturnType<typeof listTickets>>>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getMe().then((profile) => {
      setMe(profile);
      setName(profile.name);
      setPhone(profile.phone);
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load your account."));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (tab === "Addresses") listAddresses().then(setAddresses).catch(() => setAddresses([]));
    if (tab === "Orders") listOrders().then(setOrders).catch(() => setOrders([]));
    if (tab === "Alerts") {
      listNotifications().then(setNotes).catch(() => setNotes([]));
      markNotificationsRead().catch(() => undefined);
    }
    if (tab === "Support") listTickets().then(setTickets).catch(() => setTickets([]));
  }, [tab, user]);

  if (isPending) return <Shell><p className="text-sm text-muted">Checking your session…</p></Shell>;
  if (!user) return <RedirectToSignIn />;

  return (
    <Shell>
      <h1 className="text-2xl font-extrabold tracking-tight">Account</h1>
      <p className="text-sm text-muted">{user.primaryEmail ?? user.displayName}</p>
      {me && isStaff(me.roles) ? (
        <div className="mt-3 flex gap-2">
          <Link to="/admin" className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-semibold text-cream">Store desk</Link>
          <Link to="/rider" className="inline-flex h-10 items-center rounded-full bg-brand px-4 text-sm font-semibold">Rider</Link>
        </div>
      ) : null}
      <div className="rail mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold ${tab === item ? "bg-ink text-cream" : "border border-line bg-cream"}`}>
            {item}
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {tab === "Profile" ? (
        <form
          className="mt-4 max-w-md space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            updateProfile({ data: { fullName: name, phone } })
              .then(() => toast.success("Profile saved"))
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not save."));
          }}
        >
          <label className="block text-sm font-semibold">Name
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-full border border-line bg-cream px-4 font-normal" />
          </label>
          <label className="block text-sm font-semibold">Mobile
            <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" placeholder="10-digit mobile" className="mt-1 h-11 w-full rounded-full border border-line bg-cream px-4 font-normal" />
          </label>
          <p className="text-xs text-muted">Used on delivery calls. Sign-in stays on email, Google or X.</p>
          <button type="submit" className="h-11 rounded-full bg-brand px-5 font-bold">Save</button>
          <div className="pt-2"><UserButton /></div>
        </form>
      ) : null}
      {tab === "Addresses" ? (
        <ul className="mt-4 space-y-3">
          {addresses.length === 0 ? <li className="text-sm text-muted">No saved addresses yet. Add one at checkout.</li> : null}
          {addresses.map((address) => (
            <li key={address.id} className="rounded-3xl border border-line bg-cream p-4">
              <p className="font-semibold">{address.label} · {address.area}</p>
              <p className="text-sm text-muted">{address.line1}, {address.city} {address.pincode}</p>
              {catalog && !catalog.areas.some((area) => area.pincode === address.pincode) ? <p className="text-xs font-semibold text-danger">Outside the delivery area</p> : null}
              <button type="button" className="mt-2 text-sm font-semibold text-danger" onClick={() => deleteAddress({ data: address.id }).then(() => setAddresses((rows) => rows.filter((row) => row.id !== address.id)))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "Orders" ? (
        <ul className="mt-4 space-y-3">
          {orders.length === 0 ? <li className="text-sm text-muted">No orders yet.</li> : null}
          {orders.map((order) => (
            <li key={order.publicId}>
              <Link to="/orders/$id" params={{ id: order.publicId }} className="block rounded-3xl border border-line bg-cream p-4">
                <span className="flex items-center justify-between">
                  <span className="font-semibold">{order.publicId}</span>
                  <span className="rounded-full bg-brand px-2 py-1 text-xs font-bold">{STATUS_LABEL[order.status] ?? order.status}</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{order.itemCount} items · {inr(order.payablePaise)} · {order.paymentMethod === "cod" ? "Cash" : "Online"}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "Alerts" ? (
        <ul className="mt-4 space-y-3">
          {notes.length === 0 ? <li className="text-sm text-muted">No alerts yet. Order updates land here.</li> : null}
          {notes.map((note) => (
            <li key={note.id} className="rounded-3xl border border-line bg-cream p-4">
              <p className="font-semibold">{note.title}</p>
              <p className="text-sm text-muted">{note.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "Support" ? (
        <div className="mt-4 max-w-md">
          <p className="text-sm text-muted">Care {catalog?.settings.supportPhone} · {catalog?.settings.supportEmail}</p>
          <form
            className="mt-3 space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              createTicket({ data: { subject, body } })
                .then(async () => {
                  setSubject("");
                  setBody("");
                  setTickets(await listTickets());
                  toast.success("Ticket sent");
                })
                .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not send."));
            }}
          >
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className="h-11 w-full rounded-full border border-line bg-cream px-4" />
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What do you need?" className="min-h-28 w-full rounded-3xl border border-line bg-cream p-4" />
            <button type="submit" className="h-11 rounded-full bg-brand px-5 font-bold">Send</button>
          </form>
          <ul className="mt-4 space-y-2">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="rounded-2xl border border-line p-3">
                <p className="font-semibold">{ticket.subject}</p>
                <p className="text-sm text-muted">{ticket.body}</p>
                <p className="text-xs uppercase">{ticket.status}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Shell>
  );
}
