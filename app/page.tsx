import Image from "next/image";

export default function Home() {
  return (
    <div>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Assumenda ea
      iure asperiores reiciendis similique sed doloremque ab dolores praesentium
      natus molestiae, mollitia officia, aspernatur nulla officiis excepturi.
      Ab, impedit exercitationem.
      <div className="flex items-center justify-center">
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          className="dark:invert"
          width={100}
          height={24}
        />
      </div>
    </div>
  );
}
