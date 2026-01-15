import { useEffect } from "react";

export default function BeholdFeed() {
  useEffect(() => {
    if (!document.getElementById("behold-script")) {
      const script = document.createElement("script");
      script.src = "https://w.behold.so/widget.js";
      script.async = true;
      script.id = "behold-script";
      document.body.appendChild(script);
    }
  }, []);

  return <div data-behold-id="https://feeds.behold.so/wJtsPDUxJSl2oj3P5PcZ" />;
}
