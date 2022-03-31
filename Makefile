ECC=emcc
CFLAGS=-O3
datadir=@datadir@

# BEGIN app specific
MMCDEPS=mpi_mc_mi.o mc_checkpoints.o  mc_end_mi.o  mc_energies_mi.o  mc_initialization_mi.o mc_integrate_mi.o  mc_verlet_lists.o  mc_global.o mc_base_pairing.o  mc_utils.o mc_ermsd_mi.o
PREFIXED_OBJ_FILES=$(addprefix $(OBJ_DIR)/, $(MMCDEPS))


$(OBJ_DIR)/%.o : $(SOURCE_DIR)/%.c
	$(ECC) $(CFLAGS) -DFROZEN -o $@ -c $<
$(OBJ_DIR)/%_mi.o : $(SOURCE_DIR)/%.c
	$(ECC) $(CFLAGS) -DFROZEN -DNOCTCS -DERMSDR  -o $@ -c $<

app: $(PREFIXED_OBJ_FILES)
	$(ECC) $(CFLAGS) $(PREFIXED_OBJ_FILES) -DFROZEN -DSPQR_DATA=$(datadir)/spqr -o $(BUILD_DIR)/$(PACKAGE).js -lm --preload-file $(FILESYSTEM_DIR)@/ -s ASSERTIONS=1 -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_RUNTIME_METHODS=FS,PATH 
# END app specific

