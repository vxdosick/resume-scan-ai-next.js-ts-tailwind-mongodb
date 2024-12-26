import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <footer className="footer py-6">
          <div className="footer__container flex flex-col gap-1 main__container">
            <div className="flex footer__links items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  width={30}
                  height={30}
                  src="/images/coffe.png"
                  alt="image"
                />
                <Link href="buymeacoffee.com/vxdosick" className="small--text">
                  Support the project
                </Link>
              </div>
              <Link
                href="/"
                className="footer__logo logo--smalltext text-center absolute left-1/2 transform -translate-x-1/2"
              >
                ResumeScanAi
              </Link>
              <Link href="/" className="link--normal">
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
    )
}

export default Footer