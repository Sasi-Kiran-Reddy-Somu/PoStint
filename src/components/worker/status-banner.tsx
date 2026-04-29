export function StatusBanner({ status }: { status: string }) {
  if (status === "paused") {
    return (
      <div className="bg-yellow-950/50 border-b border-yellow-900 px-6 py-3 text-sm text-yellow-200">
        <strong>Your account is paused.</strong> Tasks are paused while we wait for your account to recover.
        Existing pending credits will still process normally.
      </div>
    );
  }
  if (status === "suspended") {
    return (
      <div className="bg-red-950/50 border-b border-red-900 px-6 py-3 text-sm text-red-200">
        <strong>Your account has been suspended.</strong> You can still withdraw your available credits.
        Contact support if you wish to appeal.
      </div>
    );
  }
  return null;
}
