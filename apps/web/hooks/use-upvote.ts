"use client"

import { storiesApi } from "@/lib/api";
import { useState, useEffect } from "react"
import { toast } from "sonner";

interface UseUpvoteOptions {
    storyId: string;
    initialUpvotes: number;
    initialHasUpvoted?: boolean;
}

export function useUpvote({ storyId, initialHasUpvoted, initialUpvotes }: UseUpvoteOptions) {
    const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
    const [upvoteCount, setUpvoteCount] = useState(initialUpvotes);
    const [isUpvoting, setIsUpvoting] = useState(false);


    useEffect(() => {
        setUpvoteCount(initialUpvotes);
    }, [initialUpvotes]);

    const toggleUpvote = async () => {
        if (isUpvoting) return;

        const wasUpvoted = hasUpvoted;
        const previousCount = upvoteCount;

        setHasUpvoted(!wasUpvoted)
        setUpvoteCount(wasUpvoted ? previousCount - 1 : previousCount + 1);

        setIsUpvoting(true);

        const result = await storiesApi.upvote(storyId);

        if (result.error) {
            setHasUpvoted(wasUpvoted);
            setUpvoteCount(previousCount);
            toast.error(result.error.message);
        }

        setIsUpvoting(false);
    }

    return {
        hasUpvoted,
        upvoteCount,
        isUpvoting,
        toggleUpvote,
    };
}