// Neutral cream placeholder shown when src is missing or fails to load.
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 4" preserveAspectRatio="xMidYMid slice">
       <rect width="3" height="4" fill="#EDE5D8"/>
       <text x="1.5" y="2.2" font-family="serif" font-size="0.3" fill="#B8A478" text-anchor="middle">Wangaré</text>
     </svg>`
  );

export default function SafeImg({ src, alt = "", loading = "lazy", onError, ...rest }) {
  const handleError = (e) => {
    if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
    onError?.(e);
  };
  return <img src={src || PLACEHOLDER} alt={alt} loading={loading} onError={handleError} {...rest} />;
}
