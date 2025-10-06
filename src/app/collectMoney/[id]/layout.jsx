const FormLayout = ({ children }) => {
  return (
    <div
      style={{
        display: " flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      }}
    >
      {children}
    </div>
  );
};

export default FormLayout;
