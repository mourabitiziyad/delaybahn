import Image from "next/image";

export function Avatar({ url, className }: Readonly<{ url: string, className: string }>) {
  return (
    <div className="avatar">
      <div className={className}>
        <Image
          height={300}
          width={300}
          style={{ objectFit: "contain" }}
          src={url}
          alt=""
        />
      </div>
    </div>
  );
}
