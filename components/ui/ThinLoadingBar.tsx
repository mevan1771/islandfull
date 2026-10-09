export default function ThinLoadingBar() {
  return (
    <div
      style={{
        width: "100%",
        height: "2px",
        overflow: "hidden",
        position: "relative",
        margin: "16px auto 0",
        backgroundColor: "#f3f4f6",
      }}
    >
      <div
        className="islandfull-load-bar"
        style={{
          position: "absolute",
          height: "100%",
          backgroundColor: "#FF8C00",
        }}
      />
    </div>
  )
}
