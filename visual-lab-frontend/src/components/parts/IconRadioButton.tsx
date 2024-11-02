export default ({
  src,
  label,
  selected,
  onClick,
}: {
  src: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <div onClick={onClick}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: selected ? "3px solid yellow" : "none",
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
        }}
      ></div>
      <div>
        <p style={{ textAlign: "center", fontSize: 12, width: 64 }}>{label}</p>
      </div>
    </div>
  );
};
