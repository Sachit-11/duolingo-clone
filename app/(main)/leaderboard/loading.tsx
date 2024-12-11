import { Loader } from "lucide-react";

const Loading = () => {
    // this is a default file name in nextjs which is used to show content while the page is loading
    return (
        <div className = "h-full w-full flex items-center justify-center">
            <Loader className = "h-6 w-6 text-muted-foreground animate-spin" />
        </div>
    )
}

export default Loading;