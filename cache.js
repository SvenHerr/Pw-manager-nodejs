export default function ({ whitelist = null, blacklist = null } = {}) {
    return function cache(req, res, next) {
        if (whitelist && whitelist.indexOf(req.path) !== -1) {
            return next();
        }

        if (blacklist && blacklist.indexOf(req.path) === -1) {
            return next();
        }

        res.setHeader("Surrogate-Control", "no-store");
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        next();
    };
}
