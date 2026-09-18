const GridBackdrop = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 bg-[#f3f8f4]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(21,63,53,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(21,63,53,0.07) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    >
      <div className="absolute -left-32 top-16 h-96 w-96 rounded-[40%] bg-[#d3f36b]/25 blur-3xl" />

      <div className="absolute right-[-8%] top-[42%] size-96 rounded-[45%] bg-[#4b8b71]/15 blur-3xl" />

      <div className="absolute -bottom-24 left-1/3 size-72 rounded-[50%] bg-[#153e34]/10 blur-3xl" />
    </div>
  );
};

export default GridBackdrop;