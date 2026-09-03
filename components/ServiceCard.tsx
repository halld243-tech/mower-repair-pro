import Image from "next/image";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
}

export default function ServiceCard({
  id,
  name,
  description,
  price,
  duration,
  image,
}: ServiceCardProps) {
  return (
    <article className="catalog-card">
      {image && (
        <Image
          src={image}
          alt={name}
          className="catalog-image"
          width={800}
          height={400}
          unoptimized
        />
      )}
      <div className="catalog-content">
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="catalog-meta">
          <div>
            <strong>${price}</strong>
            <span>{duration} min</span>
          </div>
          <a
            href={`/booking?serviceId=${id}`}
            className="catalog-action"
          >
            Book <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
