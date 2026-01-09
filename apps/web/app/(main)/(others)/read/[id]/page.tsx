import { StoryReader } from "@/components/reader/story-reader";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ReadPage({ params }: PageProps) {
    const { id } = await params;
    return <StoryReader storyId={id} />;
}