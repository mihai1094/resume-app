import { useState, useCallback } from "react";

export function useBulletSelector() {
    const [isOpen, setIsOpen] = useState(false);

    const openSelector = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeSelector = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleSelector = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return {
        isOpen,
        openSelector,
        closeSelector,
        toggleSelector,
        setIsOpen,
    };
}
