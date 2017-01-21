# Roots of the synchronization

# Paths to synchronize
#path = current
#path = common
#path = .netscape/bookmarks.html

# Some regexps specifying names and paths to ignore
#ignore = Path stats    ## ignores /var/www/stats
#ignore = Path stats/*  ## ignores /var/www/stats/*
#ignore = Path */stats  ## ignores /var/www/somedir/stats, but not /var/www/a/b/c/stats
#ignore = Name *stats   ## ignores all files/directories that end with "stats"
#ignore = Name stats*   ## ignores all files/directories that begin with "stats"
#ignore = Name *.tmp    ## ignores all files with the extension .tmp

#          When set to true, this flag causes the user interface to skip
#          asking for confirmations on non-conflicting changes. (More
#          precisely, when the user interface is done setting the
#          propagation direction for one entry and is about to move to the
#          next, it will skip over all non-conflicting entries and go
#          directly to the next conflict.)
auto=true

#          When this is set to true, the user interface will ask no
#          questions at all. Non-conflicting changes will be propagated;
#          conflicts will be skipped.
batch=true

#          !When this is set to true, Unison will request an extra
#          confirmation if it appears that the entire replica has been
#          deleted, before propagating the change. If the batch flag is
#          also set, synchronization will be aborted. When the path
#          preference is used, the same confirmation will be requested for
#          top-level paths. (At the moment, this flag only affects the
#          text user interface.) See also the mountpoint preference.
confirmbigdel=false

#          When this preference is set to true, Unison will use the
#          modification time and length of a file as a `pseudo inode
#          number' when scanning replicas for updates, instead of reading
#          the full contents of every file. Under Windows, this may cause
#          Unison to miss propagating an update if the modification time
#          and length of the file are both unchanged by the update.
#          However, Unison will never overwrite such an update with a
#          change from the other replica, since it always does a safe
#          check for updates just before propagating a change. Thus, it is
#          reasonable to use this switch under Windows most of the time
#          and occasionally run Unison once with fastcheck set to false,
#          if you are worried that Unison may have overlooked an update.
#          The default value of the preference is auto, which causes
#          Unison to use fast checking on Unix replicas (where it is safe)
#          and slow checking on Windows replicas. For backward
#          compatibility, yes, no, and default can be used in place of
#          true, false, and auto. See the section "Fast Checking" for more
#          information.
fastcheck=true

#          Including the preference -prefer root causes Unison always to
#          resolve conflicts in favor of root, rather than asking for
#          guidance from the user. (The syntax of root is the same as for
#          the root preference, plus the special values newer and older.)
#          This preference is overridden by the preferpartial preference.
#          This preference should be used only if you are sure you know
#          what you are doing!
prefer=newer

#          When this flag is set to true, file modification times (but not
#          directory modtimes) are propagated.
times=true

#
#
watch=true
