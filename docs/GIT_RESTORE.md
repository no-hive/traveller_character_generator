# Git repository v15.1

The archive includes ready-to-run sources and the complete Git history in repository.bundle, with tags v15 and v15.1. No server credentials are included in the bundle.

To restore the Git repository, run from traveller-local:

```sh
git clone repository.bundle traveller-repository
cd traveller-repository
git checkout v15.1
```

For normal local use, cloning is unnecessary. Run `python3 start-local.py`, then open http://localhost:8000 in a desktop window at least 1024 px wide. Original story illustrations are supplied separately.
